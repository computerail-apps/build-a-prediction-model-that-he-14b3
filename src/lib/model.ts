export interface Candle {
  ts: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  yes: OrderBookLevel[];
  no: OrderBookLevel[];
}

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

/** Volume-weighted average of candle closes, expressed as a 0-1 probability. */
export function vwapMid(candles: Candle[]): number {
  if (!candles.length) return 0.5;
  const totalVol = candles.reduce((s, c) => s + c.volume, 0);
  if (totalVol === 0) return candles[candles.length - 1].close / 100;
  const weighted = candles.reduce((s, c) => s + (c.close / 100) * c.volume, 0);
  return weighted / totalVol;
}

/** Short-term drift over the last few candles, clamped to +/-10 probability points. */
export function momentumScore(candles: Candle[]): number {
  if (candles.length < 2) return 0;
  const recent = candles.slice(-6);
  const first = recent[0].close / 100;
  const last = recent[recent.length - 1].close / 100;
  const delta = last - first;
  return Math.max(-0.1, Math.min(0.1, delta));
}

/**
 * Blends last traded price, volume-weighted mid, and momentum into a single
 * fair-value probability estimate for the Yes side of a contract.
 */
export function computeModelProbability(lastPriceCents: number, candles: Candle[]): number {
  const lastProb = lastPriceCents / 100;
  const vwap = vwapMid(candles);
  const momentum = momentumScore(candles);
  const blended = lastProb * 0.5 + vwap * 0.35 + (lastProb + momentum) * 0.15;
  return Math.min(0.99, Math.max(0.01, blended));
}

/** Edge expressed in percentage points: positive means model thinks Yes is underpriced. */
export function computeEdge(modelProb: number, marketProb: number): number {
  return (modelProb - marketProb) * 100;
}

export function buildOrderBook(ticker: string, yesBid: number, yesAsk: number): OrderBook {
  const seed = hashSeed(ticker);
  const yes: OrderBookLevel[] = [];
  const no: OrderBookLevel[] = [];
  for (let i = 0; i < 5; i++) {
    const bidPrice = Math.max(1, yesBid - i);
    const askPrice = Math.min(99, yesAsk + i);
    const bidSize = Math.round(200 + seededRandom(seed + i * 7) * 3800);
    const askSize = Math.round(200 + seededRandom(seed + i * 13 + 500) * 3800);
    yes.push({ price: bidPrice, size: bidSize });
    no.push({ price: askPrice, size: askSize });
  }
  return { yes, no };
}
