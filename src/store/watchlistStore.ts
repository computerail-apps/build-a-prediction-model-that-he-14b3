import { create } from 'zustand';

export interface WatchlistItem {
  ticker: string;
  title: string;
  notes: string | null;
  last_model_probability: number | null;
  last_market_probability: number | null;
  last_edge: number | null;
  last_checked_at: string | null;
}

interface WatchlistState {
  items: WatchlistItem[];
  add: (item: WatchlistItem) => void;
  remove: (ticker: string) => void;
  updateNotes: (ticker: string, notes: string) => void;
  refreshItem: (ticker: string, patch: Partial<WatchlistItem>) => void;
}

const INITIAL_WATCHLIST: WatchlistItem[] = [
  {
    ticker: 'PRES-24-DEM',
    title: 'Democrat wins 2024 presidential election?',
    notes: 'Watching for polling swings after debates.',
    last_model_probability: 0.49,
    last_market_probability: 0.47,
    last_edge: 2.1,
    last_checked_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    ticker: 'AI-GPT5-24',
    title: 'GPT-5 released before year end?',
    notes: null,
    last_model_probability: 0.24,
    last_market_probability: 0.19,
    last_edge: 5.3,
    last_checked_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    ticker: 'SB-CHIEFS-WIN',
    title: 'Chiefs win the Super Bowl?',
    notes: 'Model has been consistently above market for two weeks.',
    last_model_probability: 0.3,
    last_market_probability: 0.27,
    last_edge: 3.0,
    last_checked_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export const useWatchlistStore = create<WatchlistState>((set) => ({
  items: INITIAL_WATCHLIST,
  add: (item) =>
    set((s) => (s.items.some((i) => i.ticker === item.ticker) ? s : { items: [item, ...s.items] })),
  remove: (ticker) => set((s) => ({ items: s.items.filter((i) => i.ticker !== ticker) })),
  updateNotes: (ticker, notes) =>
    set((s) => ({ items: s.items.map((i) => (i.ticker === ticker ? { ...i, notes } : i)) })),
  refreshItem: (ticker, patch) =>
    set((s) => ({ items: s.items.map((i) => (i.ticker === ticker ? { ...i, ...patch } : i)) })),
}));
