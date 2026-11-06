import axios from 'axios';
import {
  createWalletClient, createPublicClient, http, parseUnits, formatUnits,
  Address, erc20Abi, maxUint256, Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

const ONEINCH_BASE = 'https://api.1inch.dev/swap/v6.0/1';
const ONEINCH_KEY = process.env.ONEINCH_API_KEY!;
const RPC_PRIMARY = process.env.RPC_PRIMARY!;
const RPC_FALLBACK = process.env.RPC_FALLBACK!;
const FEE_BPS = 100;
const SLIPPAGE_BPS = 50;

export const USDC: Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const TREASURY: Address = (process.env.TREASURY_WALLET ?? '0x0000000000000000000000000000000000000000') as Address;

const publicClient = createPublicClient({ chain: mainnet, transport: http(RPC_PRIMARY) });
const fallbackClient = createPublicClient({ chain: mainnet, transport: http(RPC_FALLBACK) });

async function rpcCall<T>(fn: (c: typeof publicClient) => Promise<T>): Promise<T> {
  try { return await fn(publicClient); }
  catch (e) {
    console.warn('[dexRouter] primary RPC failed, using fallback:', (e as Error).message);
    return await fn(fallbackClient);
  }
}

export interface SwapQuoteResult {
  dstAmount: bigint;
  tx: { from: Address; to: Address; data: Hex; value: bigint; gas: bigint; gasPrice: bigint; };
  feeUsdc: bigint;
}

export async function getSwapQuote(params: {
  src: Address; dst: Address; amountIn: bigint; from: Address; slippageBps?: number;
}): Promise<SwapQuoteResult> {
  const slippage = params.slippageBps ?? SLIPPAGE_BPS;
  const res = await axios.get(`${ONEINCH_BASE}/swap`, {
    params: {
      src: params.src, dst: params.dst, amount: params.amountIn.toString(),
      from: params.from, slippage: slippage / 100, fee: (FEE_BPS / 100).toFixed(2),
      referrer: TREASURY, disableEstimate: false, allowPartialFill: false,
    },
    headers: { Authorization: `Bearer ${ONEINCH_KEY}` },
    timeout: 15000,
  });
  const data = res.data;
  const feeUsdc = params.src.toLowerCase() === USDC.toLowerCase()
    ? (params.amountIn * BigInt(FEE_BPS)) / 10000n : 0n;
  return {
    dstAmount: BigInt(data.dstAmount),
    tx: {
      from: data.tx.from as Address, to: data.tx.to as Address,
      data: data.tx.data as Hex, value: BigInt(data.tx.value ?? 0),
      gas: BigInt(data.tx.gas ?? 300000), gasPrice: BigInt(data.tx.gasPrice ?? 0),
    },
    feeUsdc,
  };
}

export async function ensureApproval(params: {
  owner: Address; token: Address; spender: Address; amount: bigint;
  walletClient: ReturnType<typeof createWalletClient>;
}): Promise<void> {
  const allowance = await rpcCall(c => c.readContract({
    address: params.token, abi: erc20Abi, functionName: 'allowance',
    args: [params.owner, params.spender],
  }) as Promise<bigint>);
  if (allowance >= params.amount) return;
  const hash = await params.walletClient.writeContract({
    address: params.token, abi: erc20Abi, functionName: 'approve',
    args: [params.spender, maxUint256], account: params.owner, chain: mainnet,
  });
  await rpcCall(c => c.waitForTransactionReceipt({ hash }));
}

export async function executeSwap(params: {
  src: Address; dst: Address; amountIn: bigint;
  walletClient: ReturnType<typeof createWalletClient>; owner: Address;
}): Promise<{ txHash: Hex; dstAmount: bigint; feeUsdc: bigint }> {
  const quote = await getSwapQuote({ src: params.src, dst: params.dst, amountIn: params.amountIn, from: params.owner });
  await ensureApproval({ owner: params.owner, token: params.src, spender: quote.tx.to, amount: params.amountIn, walletClient: params.walletClient });
  const hash = await params.walletClient.sendTransaction({
    account: params.owner, to: quote.tx.to, data: quote.tx.data,
    value: quote.tx.value, gas: quote.tx.gas, chain: mainnet,
  });
  await rpcCall(c => c.waitForTransactionReceipt({ hash }));
  return { txHash: hash, dstAmount: quote.dstAmount, feeUsdc: quote.feeUsdc };
}

export function buildKeeperWallet() {
  const pk = process.env.KEEPER_PRIVATE_KEY;
  if (!pk) throw new Error('KEEPER_PRIVATE_KEY missing');
  const account = privateKeyToAccount(pk as Hex);
  return createWalletClient({ account, chain: mainnet, transport: http(RPC_PRIMARY) });
}

export { formatUnits, parseUnits };
