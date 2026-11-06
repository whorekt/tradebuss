export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1w' | '1Mo';
export const TIMEFRAMES: Timeframe[] = ['1m','5m','15m','1h','4h','1D','1w','1Mo'];
export const TF_TO_MS: Record<Timeframe, number> = {
  '1m': 60_000,'5m': 300_000,'15m': 900_000,'1h': 3_600_000,
  '4h': 14_400_000,'1D': 86_400_000,'1w': 604_800_000,'1Mo': 2_592_000_000,
};
export interface Candle { time:number;open:number;high:number;low:number;close:number;volume:number; }
export interface SignalSetup {
  id:string;pair:string;baseToken:string;quoteToken:string;timeframe:Timeframe;
  entry:number;takeProfit:number;stopLoss:number;tpPct:number;slPct:number;
  rrRatio:number;rsi:number;ema200:number;support:number;confluences:string[];createdAt:number;
}
export type PositionStatus = 'open'|'tp_hit'|'sl_hit'|'manual_close';
export interface Position {
  id:string;walletAddress:string;pair:string;baseToken:string;quoteToken:string;
  entryPrice:number;entryAmountUsdc:number;tokenAmount:number;
  takeProfit:number;stopLoss:number;status:PositionStatus;feeUsdc:number;
  exitPrice?:number;exitAmountUsdc?:number;permitSignature?:string;permitDeadline?:number;
  createdAt:number;closedAt?:number;
}
export interface NotificationPayload {
  type:'new_setup'|'tp_hit'|'sl_hit'|'manual_close';
  title:string;body:string;pair?:string;timeframe?:Timeframe;timestamp:number;
}
