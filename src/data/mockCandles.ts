import type { Candle } from '@/lib/model';
import { MOCK_MARKETS } from './mockMarkets';

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) || 1;
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function buildCandles(ticker: string, basePrice: number): Candle[] {
  const seed = hashSeed(ticker);
  const now = Date.now();
  const candles: Candle[] = [];
  let price = basePrice;
  for (let i = 29; i >= 0; i--) {
    const r = seededRandom(seed + i);
    const drift = (r - 0.5) * 4;
    price = Math.min(97, Math.max(3, price + drift));
    const high = Math.min(99, price + seededRandom(seed + i + 100) * 2);
    const low = Math.max(1, price - seededRandom(seed + i + 200) * 2);
    const close = Math.min(99, Math.max(1, price + (seededRandom(seed + i + 300) - 0.5) * 2));
    const volume = Math.round(500 + seededRandom(seed + i + 400) * 4500);
    candles.push({ ts: now - i * 60 * 60 * 1000, open: price, high, low, close, volume });
    price = close;
  }
  return candles;
}

export const MOCK_CANDLES: Record<string, Candle[]> = Object.fromEntries(
  MOCK_MARKETS.map((m) => [m.ticker, buildCandles(m.ticker, m.lastPrice)])
);
