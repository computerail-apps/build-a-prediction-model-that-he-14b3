const BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

async function kalshiFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      detail = res.statusText;
    }
    throw new Error(`Kalshi API error ${res.status}: ${detail || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

function dollarsToCents(d?: string): number {
  if (!d) return 0;
  const n = parseFloat(d);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

function toNum(s?: string): number {
  if (!s) return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

interface RawMarket {
  ticker: string;
  event_ticker: string;
  title?: string;
  status: string;
  last_price_dollars?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  volume_fp?: string;
  open_interest_fp?: string;
  close_time: string;
  yes_sub_title?: string;
}

interface RawEvent {
  event_ticker: string;
  category: string;
  title: string;
  markets?: RawMarket[];
}

export interface Market {
  ticker: string;
  eventTicker: string;
  seriesTicker: string;
  title: string;
  category: string;
  status: string;
  lastPrice: number;
  yesBid: number;
  yesAsk: number;
  volume: number;
  openInterest: number;
  closeTime: string;
}

function mapMarket(raw: RawMarket, category: string, fallbackTitle: string): Market {
  const seriesTicker = raw.ticker.split('-')[0];
  const title = raw.title && raw.title.length > 0
    ? raw.title
    : raw.yes_sub_title && raw.yes_sub_title.length > 0
      ? `${fallbackTitle} — ${raw.yes_sub_title}`
      : fallbackTitle;
  return {
    ticker: raw.ticker,
    eventTicker: raw.event_ticker,
    seriesTicker,
    title,
    category,
    status: raw.status,
    lastPrice: dollarsToCents(raw.last_price_dollars),
    yesBid: dollarsToCents(raw.yes_bid_dollars),
    yesAsk: dollarsToCents(raw.yes_ask_dollars),
    volume: toNum(raw.volume_fp),
    openInterest: toNum(raw.open_interest_fp),
    closeTime: raw.close_time,
  };
}

export async function fetchMarketsList(limit = 100): Promise<Market[]> {
  const data = await kalshiFetch<{ events: RawEvent[] }>('/events', {
    limit,
    status: 'open',
    with_nested_markets: true,
  });
  const markets: Market[] = [];
  for (const ev of data.events ?? []) {
    for (const m of ev.markets ?? []) {
      if (m.status !== 'active' && m.status !== 'open') continue;
      markets.push(mapMarket(m, ev.category || 'Other', ev.title));
    }
  }
  return markets;
}

export async function fetchMarket(ticker: string): Promise<Market> {
  const data = await kalshiFetch<{ market: RawMarket }>(`/markets/${encodeURIComponent(ticker)}`);
  const raw = data.market;
  let category = 'Market';
  let eventTitle = raw.title || raw.ticker;
  try {
    const evData = await kalshiFetch<{ event: RawEvent }>(`/events/${encodeURIComponent(raw.event_ticker)}`);
    category = evData.event.category || category;
    eventTitle = evData.event.title || eventTitle;
  } catch {
    // best-effort enrichment only; primary market data already available
  }
  return mapMarket(raw, category, eventTitle);
}

export interface Candle {
  endPeriodTs: number;
  openDollars: number | null;
  closeDollars: number | null;
  highDollars: number | null;
  lowDollars: number | null;
  meanDollars: number | null;
  volume: number;
}

interface RawCandle {
  end_period_ts: number;
  volume_fp?: string;
  price?: {
    open_dollars?: string;
    close_dollars?: string;
    high_dollars?: string;
    low_dollars?: string;
    mean_dollars?: string;
  };
}

export async function fetchCandlesticks(seriesTicker: string, ticker: string, lookbackHours = 168): Promise<Candle[]> {
  const endTs = Math.floor(Date.now() / 1000);
  const startTs = endTs - lookbackHours * 3600;
  const data = await kalshiFetch<{ candlesticks: RawCandle[] }>(
    `/series/${encodeURIComponent(seriesTicker)}/markets/${encodeURIComponent(ticker)}/candlesticks`,
    { start_ts: startTs, end_ts: endTs, period_interval: 60 },
  );
  return (data.candlesticks ?? []).map((c) => ({
    endPeriodTs: c.end_period_ts,
    openDollars: c.price?.open_dollars ? parseFloat(c.price.open_dollars) : null,
    closeDollars: c.price?.close_dollars ? parseFloat(c.price.close_dollars) : null,
    highDollars: c.price?.high_dollars ? parseFloat(c.price.high_dollars) : null,
    lowDollars: c.price?.low_dollars ? parseFloat(c.price.low_dollars) : null,
    meanDollars: c.price?.mean_dollars ? parseFloat(c.price.mean_dollars) : null,
    volume: toNum(c.volume_fp),
  }));
}

export interface OrderbookLevel {
  priceCents: number;
  size: number;
}

export interface Orderbook {
  yes: OrderbookLevel[];
  no: OrderbookLevel[];
}

export async function fetchOrderbook(ticker: string): Promise<Orderbook> {
  const data = await kalshiFetch<{ orderbook_fp: { yes_dollars?: [string, string][]; no_dollars?: [string, string][] } }>(
    `/markets/${encodeURIComponent(ticker)}/orderbook`,
  );
  const mapLevels = (levels?: [string, string][]): OrderbookLevel[] =>
    (levels ?? []).map(([price, size]) => ({ priceCents: Math.round(parseFloat(price) * 100), size: parseFloat(size) }));
  return {
    yes: mapLevels(data.orderbook_fp.yes_dollars).sort((a, b) => b.priceCents - a.priceCents),
    no: mapLevels(data.orderbook_fp.no_dollars).sort((a, b) => b.priceCents - a.priceCents),
  };
}
