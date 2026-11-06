import { createClient, SupabaseClient } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { Address, formatUnits } from 'viem';
import { USDC, executeSwap, buildKeeperWallet } from '../../config/dexRouter';
import { Position } from '../../lib/types';

const WSS_URL = process.env.BINANCE_WSS ?? 'wss://stream.binance.com:9443/stream';
const POLL_INTERVAL_MS = 5000;

export class KeeperBot {
  private supabase: SupabaseClient;
  private wallet = buildKeeperWallet();
  private walletAddress: Address;
  private prices = new Map<string, number>();
  private openPositions = new Map<string, Position>();
  private ws?: WebSocket;
  private timer?: NodeJS.Timeout;

  constructor(url: string, key: string) {
    this.supabase = createClient(url, key);
    this.walletAddress = this.wallet.account!.address as Address;
  }

  async start() {
    console.log('[keeper] wallet:', this.walletAddress);
    await this.reloadPositions();
    this.subscribePrices();
    this.timer = setInterval(() => this.tick(), POLL_INTERVAL_MS);
    setInterval(() => this.reloadPositions().catch(console.error), 30_000);
  }

  private async reloadPositions() {
    const { data, error } = await this.supabase.from('positions').select('*').eq('status','open');
    if (error) throw error;
    this.openPositions.clear();
    for (const r of data ?? []) this.openPositions.set(r.id, this.rowToPosition(r));
  }

  private rowToPosition(r: any): Position {
    return {
      id:r.id, walletAddress:r.wallet_address, pair:r.pair,
      baseToken:r.base_token, quoteToken:r.quote_token,
      entryPrice:+r.entry_price, entryAmountUsdc:+r.entry_amount_usdc,
      tokenAmount:+r.token_amount, takeProfit:+r.take_profit, stopLoss:+r.stop_loss,
      status:r.status, feeUsdc:+r.fee_usdc,
      exitPrice:r.exit_price?+r.exit_price:undefined,
      exitAmountUsdc:r.exit_amount_usdc?+r.exit_amount_usdc:undefined,
      permitSignature:r.permit_signature ?? undefined,
      permitDeadline:r.permit_deadline ?? undefined,
      createdAt:+r.created_at, closedAt:r.closed_at?+r.closed_at:undefined,
    };
  }

  private subscribePrices() {
    const streams = ['ETHUSDC','SOLUSDC','WBTCUSDC'].map(p => `${p.toLowerCase()}@trade`).join('/');
    this.ws = new WebSocket(`${WSS_URL}?streams=${streams}`);
    this.ws.on('open', () => console.log('[keeper] WSS connected'));
    this.ws.on('message', (raw: Buffer) => {
      try { const m = JSON.parse(raw.toString()); const d = m.data; if (!d?.s || !d?.p) return; this.prices.set(this.formatPair(d.s), Number(d.p)); } catch {}
    });
    this.ws.on('error', e => console.error('[keeper] WSS error:', e.message));
    this.ws.on('close', () => { console.warn('[keeper] WSS closed, reconnect 5s'); setTimeout(() => this.subscribePrices(), 5000); });
  }

  private formatPair(s: string): string {
    if (s.endsWith('USDC')) return `${s.slice(0,-4)}/USDC`;
    if (s.endsWith('USDT')) return `${s.slice(0,-4)}/USDT`;
    return s;
  }

  private async tick() {
    for (const pos of this.openPositions.values()) {
      const price = this.prices.get(pos.pair);
      if (!price) continue;
      try {
        if (price >= pos.takeProfit) await this.closePosition(pos, price, 'tp_hit');
        else if (price <= pos.stopLoss) await this.closePosition(pos, price, 'sl_hit');
      } catch (e) { console.error(`[keeper] ${pos.id}:`, (e as Error).message); }
    }
  }

  private async closePosition(pos: Position, price: number, status: 'tp_hit'|'sl_hit') {
    const tokenAmountWei = BigInt(Math.floor(pos.tokenAmount * 1e18));
    if (tokenAmountWei === 0n) throw new Error('zero amount');
    const { txHash, dstAmount } = await executeSwap({
      src: pos.baseToken as Address, dst: USDC, amountIn: tokenAmountWei,
      walletClient: this.wallet, owner: this.walletAddress,
    });
    const exitUsdc = Number(formatUnits(dstAmount, 6));
    const feeUsdc = (exitUsdc * 100) / 10000;
    await this.supabase.from('positions').update({
      status, exit_price: price, exit_amount_usdc: exitUsdc,
      fee_usdc: pos.feeUsdc + feeUsdc, closed_at: Date.now(),
    }).eq('id', pos.id);
    await this.supabase.from('fees').insert({ position_id: pos.id, amount_usdc: feeUsdc, tx_hash: txHash, created_at: Date.now() });
    this.openPositions.delete(pos.id);
  }

  async stop() { this.ws?.close(); if (this.timer) clearInterval(this.timer); }
}
