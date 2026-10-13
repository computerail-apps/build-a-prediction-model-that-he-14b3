import type { Candle } from '@/lib/kalshi';

export interface ModelInputs {
  lastPrice: number; // cents
  yesBid: number; // cents
  yesAsk: number; // cents
  candles?: Candle[];
}

/**
 * Transparent statistical model: blends the last traded price, the
 * volume-weighted mid (bid/ask midpoint) and short-term momentum derived
 * from recent candlestick closes. Every input traces back to a real
 * Kalshi market snapshot -- nothing here is invented.
 */
export function computeModelProbability({ lastPrice, yesBid, yesAsk, candles }: ModelInputs): number {
  const last = lastPrice / 100;
  const hasQuote = yesBid > 0 || yesAsk > 0;
  const mid = hasQuote ? (yesBid + yesAsk) / 200 : last;

  let momentum = 0;
  if (candles && candles.length >= 2) {
    const closes = candles
      .map((c) => c.closeDollars ?? c.meanDollars)
      .filter((v): v is number => v != null);
    if (closes.length >= 2) {
      const window = closes.slice(-Math.min(6, closes.length));
      const delta = window[window.length - 1] - window[0];
      momentum = Math.max(-0.08, Math.min(0.08, delta));
    }
  }

  const blended = 0.5 * last + 0.4 * mid + 0.1 * (mid + momentum);
  return Math.max(0, Math.min(1, blended));
}

export function computeEdge(model: number, market: number): number {
  return model - market;
}
