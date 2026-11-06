create extension if not exists "pgcrypto";
create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null, pair text not null,
  base_token text not null, quote_token text not null,
  entry_price numeric not null, entry_amount_usdc numeric not null,
  token_amount numeric not null, take_profit numeric not null, stop_loss numeric not null,
  status text not null default 'open' check (status in ('open','tp_hit','sl_hit','manual_close')),
  fee_usdc numeric not null default 0, exit_price numeric, exit_amount_usdc numeric,
  permit_signature text, permit_deadline bigint,
  created_at bigint not null, closed_at bigint
);
create index if not exists idx_positions_status on positions(status);
create index if not exists idx_positions_wallet on positions(wallet_address);
create table if not exists setups (
  id uuid primary key, pair text not null, base_token text not null,
  quote_token text not null, timeframe text not null, entry numeric not null,
  take_profit numeric not null, stop_loss numeric not null,
  tp_pct numeric not null, sl_pct numeric not null, rr_ratio numeric not null,
  rsi numeric not null, ema200 numeric not null, support numeric not null,
  confluences jsonb not null default '[]', created_at bigint not null
);
create index if not exists idx_setups_tf on setups(timeframe, created_at desc);
create table if not exists fees (
  id uuid primary key default gen_random_uuid(),
  position_id uuid references positions(id) on delete cascade,
  amount_usdc numeric not null, tx_hash text, created_at bigint not null
);
create table if not exists push_subscriptions (
  endpoint text primary key, p256dh text not null, auth text not null,
  created_at timestamptz default now()
);
