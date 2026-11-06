import webpush, { PushSubscription } from 'web-push';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventEmitter } from 'events';
import { NotificationPayload } from '../../lib/types';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:ops@tradebus.io',
  process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!,
);

export class NotificationEngine extends EventEmitter {
  private supabase: SupabaseClient;
  private subscriptions = new Map<string, PushSubscription>();
  constructor(url: string, key: string) { super(); this.supabase = createClient(url, key); }

  async loadSubscriptions() {
    const { data, error } = await this.supabase.from('push_subscriptions').select('*');
    if (error) throw error;
    for (const r of data ?? []) this.subscriptions.set(r.endpoint, { endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } } as PushSubscription);
  }

  async addSubscription(sub: PushSubscription) {
    this.subscriptions.set(sub.endpoint, sub);
    await this.supabase.from('push_subscriptions').upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  }

  async emitNotification(p: NotificationPayload) { this.emit('notification', p); await this.pushToAll(p); }

  private async pushToAll(p: NotificationPayload) {
    const body = JSON.stringify(p);
    const dead: string[] = [];
    await Promise.allSettled([...this.subscriptions.entries()].map(async ([ep, sub]) => {
      try { await webpush.sendNotification(sub, body); }
      catch (e: any) { if (e.statusCode === 404 || e.statusCode === 410) dead.push(ep); else console.warn('[push]', e.message); }
    }));
    for (const ep of dead) { this.subscriptions.delete(ep); await this.supabase.from('push_subscriptions').delete().eq('endpoint', ep); }
  }

  notifyNewSetup(pair: string, tf: string, entry: number) {
    return this.emitNotification({ type:'new_setup', title:`New ${tf} TradeBus setup — ${pair}`, body:`Entry ${entry}`, pair, timeframe: tf as any, timestamp: Date.now() });
  }
  notifyTP(pair: string, pct: number) { return this.emitNotification({ type:'tp_hit', title:`Take Profit — ${pair}`, body:`+${pct.toFixed(2)}% 🎯`, pair, timestamp: Date.now() }); }
  notifySL(pair: string, pct: number) { return this.emitNotification({ type:'sl_hit', title:`Stop Loss — ${pair}`, body:`${pct.toFixed(2)}%`, pair, timestamp: Date.now() }); }
  notifyManualClose(pair: string) { return this.emitNotification({ type:'manual_close', title:`Closed — ${pair}`, body:`Manual exit.`, pair, timestamp: Date.now() }); }
}
