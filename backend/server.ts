import express from 'express';
import cors from 'cors';
import { SignalEngine } from './services/signalEngine';
import { KeeperBot } from './services/keeperBot';
import { NotificationEngine } from './services/notificationEngine';
import { positionsRouter } from './api/positions';
import { TIMEFRAMES } from '../lib/types';

const app = express();
app.use(cors()); app.use(express.json());
const notifications = new NotificationEngine(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const signals = new SignalEngine(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
const keeper = new KeeperBot(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
app.use('/api', positionsRouter(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, notifications));
app.get('/api/setups/:tf', async (req, res) => {
  try { res.json({ setups: await signals.fetchActiveSetups(req.params.tf as any) }); }
  catch (e: any) { res.status(500).json({ error: e.message }); }
});

async function boot() {
  await notifications.loadSubscriptions();
  await keeper.start();
  const cadence: Record<string, number> = { '1m':30_000,'5m':60_000,'15m':120_000,'1h':300_000,'4h':600_000,'1D':900_000,'1w':3_600_000,'1Mo':3_600_000 };
  for (const tf of TIMEFRAMES) {
    const run = async () => {
      try { const found = await signals.scanTimeframe(tf); for (const s of found) await notifications.notifyNewSetup(s.pair, s.timeframe, s.entry); }
      catch (e) { console.error('[boot]', tf, (e as Error).message); }
    };
    run(); setInterval(run, cadence[tf]);
  }
  app.listen(process.env.PORT ?? 4000, () => console.log('TradeBus API on :4000'));
}
boot().catch(e => { console.error(e); process.exit(1); });
