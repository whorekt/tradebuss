import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { Candle, SignalSetup, Timeframe, TIMEFRAMES } from '../../lib/types';

interface PairConfig { pair:string;baseToken:string;quoteToken:string;coingeckoId:string; }
const PAIRS: PairConfig[] = [
  { pair:'ETH/USDC', baseToken:'0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', quoteToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId:'ethereum' },
  { pair:'SOL/USDC', baseToken:'0x7dD8b07e0eA6a2c74fE9d5E1b4a5D5b8f6c9E1a2', quoteToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId:'solana' },
  { pair:'WBTC/USDC', baseToken:'0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', quoteToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', coingeckoId:'bitcoin' },
];

export function calculateEMA(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema.push(prev);
  for (let i = period; i < values.length; i++) { prev = values[i] * k + prev * (1 - k); ema.push(prev); }
  return ema;
}

export function calculateRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) { const d = closes[i] - closes[i - 1]; if (d >= 0) gains += d; else losses -= d; }
  let avgGain = gains / period, avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    const gain = d > 0 ? d : 0, loss = d < 0 ? -d : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

export function swingLow(candles: Candle[], lookback = 50): number {
  return Math.min(...candles.slice(-lookback).map(c => c.low));
}

async function fetchCandlesFromDexScreener(pair: string, tf: Timeframe, limit = 250): Promise<Candle[]> {
  const [base, quote] = pair.split('/');
  const tfMap: Record<Timeframe,string> = { '1m':'minute','5m':'minute','15m':'minute','1h':'hour','4h':'hour','1D':'day','1w':'day','1Mo':'day' };
  const aggMap: Record<Timeframe,number> = { '1m':1,'5m':5,'15m':15,'1h':1,'4h':4,'1D':1,'1w':7,'1Mo':30 };
  const url = `https://api.geckoterminal.com/api/v2/networks/eth/pools/${base}-${quote}/ohlcv/${tfMap[tf]}?aggregate=${aggMap[tf]}&limit=${limit}`;
  const res = await axios.get(url, { timeout: 8000 });
  const list: any[] = res.data?.data?.attributes?.ohlcv_list ?? [];
  return list.map(r => ({ time:r[0]*1000, open:+r[1], high:+r[2], low:+r[3], close:+r[4], volume:+r[5] })).reverse();
}

async function fetchCandlesFromBinance(pair: string, tf: Timeframe, limit = 250): Promise<Candle[]> {
  const symbol = pair.replace('/', '');
  const intervalMap: Record<Timeframe,string> = { '1m':'1m','5m':'5m','15m':'15m','1h':'1h','4h':'4h','1D':'1d','1w':'1w','1Mo':'1M' };
  const res = await axios.get(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${intervalMap[tf]}&limit=${limit}`, { timeout: 8000 });
  return (res.data as any[]).map(k => ({ time:+k[0], open:+k[1], high:+k[2], low:+k[3], close:+k[4], volume:+k[5] }));
}

async function fetchCandles(pair: string, tf: Timeframe): Promise<Candle[]> {
  try { const c = await fetchCandlesFromDexScreener(pair, tf); if (c.length >= 60) return c; }
  catch (e) { console.warn(`[signalEngine] DexScreener ${pair} ${tf}:`, (e as Error).message); }
  try { return await fetchCandlesFromBinance(pair, tf); }
  catch (e) { console.warn(`[signalEngine] Binance ${pair} ${tf}:`, (e as Error).message); }
  return [];
}

export class SignalEngine {
  private supabase: SupabaseClient;
  private lastEmitted = new Map<string, number>();
  private cooldownMs = 15 * 60 * 1000;
  constructor(url: string, key: string) { this.supabase = createClient(url, key); }

  async scanTimeframe(tf: Timeframe): Promise<SignalSetup[]> {
    const out: SignalSetup[] = [];
    for (const cfg of PAIRS) {
      try { const s = await this.evaluatePair(cfg, tf); if (s) out.push(s); }
      catch (e) { console.error(`[signalEngine] ${cfg.pair} ${tf}:`, (e as Error).message); }
    }
    return out;
  }

  async scanAll(): Promise<SignalSetup[]> {
    const all: SignalSetup[] = [];
    for (const tf of TIMEFRAMES) all.push(...await this.scanTimeframe(tf));
    return all;
  }

  private async evaluatePair(cfg: PairConfig, tf: Timeframe): Promise<SignalSetup | null> {
    const candles = await fetchCandles(cfg.pair, tf);
    if (candles.length < 210) return null;
    const closes = candles.map(c => c.close);
    const ema200Series = calculateEMA(closes, 200);
    const ema200 = ema200Series[ema200Series.length - 1];
    const rsi = calculateRSI(closes, 14);
    const support = swingLow(candles, 50);
    const price = closes[closes.length - 1];
    if (!(price <= support * 1.015 && price > ema200 && rsi <= 30)) return null;
    const recentHigh = Math.max(...candles.slice(-50).map(c => c.high));
    const takeProfit = Number(Math.max(recentHigh, price * 1.08).toFixed(6));
    const stopLoss = Number((support * 0.993).toFixed(6));
    const tpPct = ((takeProfit - price) / price) * 100;
    const slPct = ((price - stopLoss) / price) * 100;
    if (tpPct <= 0 || slPct <= 0) return null;
    const key = `${cfg.pair}:${tf}`;
    const last = this.lastEmitted.get(key) ?? 0;
    if (Date.now() - last < this.cooldownMs) return null;
    const setup: SignalSetup = {
      id: randomUUID(), pair: cfg.pair, baseToken: cfg.baseToken, quoteToken: cfg.quoteToken,
      timeframe: tf, entry: Number(price.toFixed(6)), takeProfit, stopLoss,
      tpPct: Number(tpPct.toFixed(2)), slPct: Number(slPct.toFixed(2)),
      rrRatio: Number((tpPct/slPct).toFixed(2)), rsi: Number(rsi.toFixed(2)),
      ema200: Number(ema200.toFixed(6)), support: Number(support.toFixed(6)),
      confluences: ['RSI<=30','Above 200EMA','At Support'], createdAt: Date.now(),
    };
    await this.supabase.from('setups').insert({
      id: setup.id, pair: setup.pair, base_token: setup.baseToken, quote_token: setup.quoteToken,
      timeframe: setup.timeframe, entry: setup.entry, take_profit: setup.takeProfit,
      stop_loss: setup.stopLoss, tp_pct: setup.tpPct, sl_pct: setup.slPct,
      rr_ratio: setup.rrRatio, rsi: setup.rsi, ema200: setup.ema200, support: setup.support,
      confluences: setup.confluences, created_at: setup.createdAt,
    });
    this.lastEmitted.set(key, Date.now());
    return setup;
  }

  async fetchActiveSetups(tf?: Timeframe): Promise<SignalSetup[]> {
    let q = this.supabase.from('setups').select('*').order('created_at', { ascending: false }).limit(50);
    if (tf) q = q.eq('timeframe', tf);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r:any) => ({
      id:r.id, pair:r.pair, baseToken:r.base_token, quoteToken:r.quote_token,
      timeframe:r.timeframe, entry:+r.entry, takeProfit:+r.take_profit, stopLoss:+r.stop_loss,
      tpPct:+r.tp_pct, slPct:+r.sl_pct, rrRatio:+r.rr_ratio, rsi:+r.rsi,
      ema200:+r.ema200, support:+r.support, confluences:r.confluences ?? [],
      createdAt:+r.created_at,
    }));
  }
}
