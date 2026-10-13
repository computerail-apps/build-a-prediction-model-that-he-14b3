import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '@/lib/data';
import { Card, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Input } from '@/lib/ui/Input';
import { Badge } from '@/lib/ui/Badge';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EdgeBadge } from '@/components/EdgeBadge';
import { useWatchlistStore } from '@/store/watchlistStore';
import { MOCK_MARKETS, type Market } from '@/data/mockMarkets';
import { MOCK_CANDLES } from '@/data/mockCandles';
import { computeModelProbability, computeEdge } from '@/lib/model';
import { Star, Trash2, RefreshCcw, Save } from 'lucide-react';

export function WatchlistPage() {
  const watchlist = useWatchlistStore();
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const { data: liveMarkets, isLoading, error, refetch } = useAppData<Market[]>({
    key: 'kalshi-markets-for-watchlist',
    mock: MOCK_MARKETS,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const rows = useMemo(() => {
    return watchlist.items.map((item) => {
      const market = (liveMarkets ?? []).find((m) => m.ticker === item.ticker);
      if (!market) {
        return { item, market: null, model: item.last_model_probability ?? 0, marketProb: item.last_market_probability ?? 0, edge: item.last_edge ?? 0 };
      }
      const candles = MOCK_CANDLES[market.ticker] ?? [];
      const model = computeModelProbability(market.lastPrice, candles);
      const marketProb = market.lastPrice / 100;
      const edge = computeEdge(model, marketProb);
      return { item, market, model, marketProb, edge };
    });
  }, [watchlist.items, liveMarkets]);

  function saveNotes(ticker: string) {
    const value = editingNotes[ticker];
    if (value !== undefined) {
      watchlist.updateNotes(ticker, value);
      setEditingNotes((prev) => {
        const next = { ...prev };
        delete next[ticker];
        return next;
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-h1">Watchlist</h1>
          <p className="text-body text-muted-foreground">Saved markets with live-refreshed model edge.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCcw size={14} />Refresh prices
        </Button>
      </div>

      {isLoading ? (
        <CenteredSpinner label="Refreshing live prices" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't refresh watchlist</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{(error as Error).message}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Star size={20} />}
          title="No saved markets yet"
          description="Browse markets and save the ones you want to track."
          action={<Link to="/markets"><Button size="sm">Browse markets</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {rows.map(({ item, market, model, marketProb, edge }) => (
            <Card key={item.ticker}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <Link to={`/markets/${item.ticker}`} className="text-body font-medium text-foreground transition-colors hover:text-primary">
                      {item.title}
                    </Link>
                    <div className="font-mono text-micro text-muted-foreground">{item.ticker}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => watchlist.remove(item.ticker)}>
                    <Trash2 size={14} />Remove
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-lg bg-surface-elevated p-4">
                  <div>
                    <div className="text-micro uppercase tracking-wide text-muted-foreground">Model</div>
                    <div className="font-mono text-body tabular-nums">{(model * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-micro uppercase tracking-wide text-muted-foreground">Market</div>
                    <div className="font-mono text-body tabular-nums">{(marketProb * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-micro uppercase tracking-wide text-muted-foreground">Edge</div>
                    <EdgeBadge edge={edge} />
                  </div>
                </div>

                {!market && (
                  <Badge variant="outline" className="text-micro">Live price unavailable, showing last recorded values</Badge>
                )}

                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <Input
                    placeholder="Add a note"
                    value={editingNotes[item.ticker] ?? item.notes ?? ''}
                    onChange={(e) => setEditingNotes((prev) => ({ ...prev, [item.ticker]: e.target.value }))}
                  />
                  <Button size="sm" variant="outline" onClick={() => saveNotes(item.ticker)} disabled={editingNotes[item.ticker] === undefined}>
                    <Save size={14} />Save note
                  </Button>
                </div>
                <div className="text-micro text-muted-foreground">
                  Last checked {item.last_checked_at ? new Date(item.last_checked_at).toLocaleString() : 'never'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
