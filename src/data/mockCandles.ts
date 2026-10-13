import type { Candle } from '@/lib/kalshi';
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
  const nowSec = Math.floor(Date.now() / 1000);
  const candles: Candle[] = [];
  let price = basePrice;
  for (let i = 29; i >= 0; i--) {
    const r = seededRandom(seed + i);
    price = Math.min(97, Math.max(3, price + (r - 0.5) * 4));
    const high = Math.min(99, price + seededRandom(seed + i + 100) * 2);
    const low = Math.max(1, price - seededRandom(seed + i + 200) * 2);
    const close = Math.min(99, Math.max(1, price + (seededRandom(seed + i + 300) - 0.5) * 2));
    candles.push({
      endPeriodTs: nowSec - i * 3600,
      openDollars: price / 100,
      closeDollars: close / 100,
      highDollars: high / 100,
      lowDollars: low / 100,
      meanDollars: (price + close) / 200,
      volume: Math.round(500 + seededRandom(seed + i + 400) * 4500),
    });
    price = close;
  }
  return candles;
}

export const MOCK_CANDLES: Record<string, Candle[]> = Object.fromEntries(
  MOCK_MARKETS.map((m) => [m.ticker, buildCandles(m.ticker, m.lastPrice)]),
);
