import { Router, Request, Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { Address, parseUnits, formatUnits } from 'viem';
import { USDC, getSwapQuote, TREASURY } from '../../config/dexRouter';
import { NotificationEngine } from '../services/notificationEngine';
import { SignalSetup } from '../../lib/types';

export function positionsRouter(url: string, key: string, notifications: NotificationEngine): Router {
  const router = Router();
  const supabase: SupabaseClient = createClient(url, key);

  router.post('/positions', async (req: Request, res: Response) => {
    try {
      const { walletAddress, setup, sizeUsdc, customTp, customSl } = req.body as {
        walletAddress: Address; setup: SignalSetup; sizeUsdc: number; customTp?: number; customSl?: number;
      };
      if (!walletAddress || !setup || !sizeUsdc) return res.status(400).json({ error: 'missing fields' });
      if (sizeUsdc < 1) return res.status(400).json({ error: 'min 1 USDC' });
      const amountWei = parseUnits(sizeUsdc.toFixed(6), 6);
      const quote = await getSwapQuote({ src: USDC, dst: setup.baseToken as Address, amountIn: amountWei, from: walletAddress });
      const tokenAmount = Number(formatUnits(quote.dstAmount, 18));
      const feeUsdc = Number(formatUnits(quote.feeUsdc, 6));
      const id = randomUUID();
      await supabase.from('positions').insert({
        id, wallet_address: walletAddress.toLowerCase(), pair: setup.pair,
        base_token: setup.baseToken, quote_token: setup.quoteToken,
        entry_price: setup.entry, entry_amount_usdc: sizeUsdc, token_amount: tokenAmount,
        take_profit: customTp ?? setup.takeProfit, stop_loss: customSl ?? setup.stopLoss,
        status: 'open', fee_usdc: feeUsdc, created_at: Date.now(),
      });
      res.json({ position: { id, tokenAmount, feeUsdc }, swapCalldata: quote.tx });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  router.get('/positions/:wallet', async (req, res) => {
    try {
      const { data, error } = await supabase.from('positions').select('*')
        .eq('wallet_address', req.params.wallet.toLowerCase())
        .order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      res.json({ positions: data ?? [] });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  router.post('/positions/:id/close', async (req, res) => {
    try {
      const { txHash, exitPrice } = req.body as { txHash: string; exitPrice: number };
      const { data: pos } = await supabase.from('positions').select('*').eq('id', req.params.id).single();
      if (!pos) return res.status(404).json({ error: 'not found' });
      if (pos.status !== 'open') return res.status(409).json({ error: 'closed' });
      const exitUsdc = Number(pos.token_amount) * (exitPrice ?? pos.entry_price);
      const feeUsdc = (exitUsdc * 100) / 10000;
      await supabase.from('positions').update({
        status:'manual_close', exit_price: exitPrice ?? pos.entry_price,
        exit_amount_usdc: exitUsdc, fee_usdc: Number(pos.fee_usdc) + feeUsdc, closed_at: Date.now(),
      }).eq('id', req.params.id);
      await supabase.from('fees').insert({ position_id: req.params.id, amount_usdc: feeUsdc, tx_hash: txHash ?? null, created_at: Date.now() });
      await notifications.notifyManualClose(pos.pair);
      res.json({ ok: true, feeUsdc });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  router.get('/fees/:wallet', async (req, res) => {
    try {
      const { data } = await supabase.from('positions').select('fee_usdc').eq('wallet_address', req.params.wallet.toLowerCase());
      res.json({ totalFeeUsdc: (data ?? []).reduce((a, r) => a + Number(r.fee_usdc), 0) });
    } catch (e) { res.status(500).json({ error: (e as Error).message }); }
  });

  router.get('/treasury', (_req, res) => res.json({ treasury: TREASURY }));
  return router;
}
