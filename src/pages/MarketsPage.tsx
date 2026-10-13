import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '@/lib/data';
import { fetchMarketsList, type Market } from '@/lib/kalshi';
import { computeModelProbability, computeEdge } from '@/lib/model';
import { Card, CardContent } from '@/lib/ui/Card';
import { Input } from '@/lib/ui/Input';
import { Badge } from '@/lib/ui/Badge';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { Button } from '@/lib/ui/Button';
import { CategoryFilter } from '@/components/CategoryFilter';
import { EdgeBadge } from '@/components/EdgeBadge';
import { Search, LineChart, RefreshCcw } from 'lucide-react';

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

export function MarketsPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch, isFetching } = useAppData<Market[]>({
    key: 'kalshi-markets-list',
    fetchLive: () => fetchMarketsList(150),
  });

  const categories = useMemo(() => {
    const set = new Set((data ?? []).map((m) => m.category));
    return ['All', ...Array.from(set).sort()];
  }, [data]);

  const rows = useMemo(() => {
    const list = data ?? [];
    return list
      .filter((m) => category === 'All' || m.category === category)
      .filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          m.ticker.toLowerCase().includes(search.toLowerCase()),
      )
      .map((m) => {
        const model = computeModelProbability({ lastPrice: m.lastPrice, yesBid: m.yesBid, yesAsk: m.yesAsk });
        const marketProb = m.lastPrice / 100;
        const edge = computeEdge(model, marketProb);
        return { market: m, model, marketProb, edge };
      })
      .sort((a, b) => b.market.volume - a.market.volume);
  }, [data, category, search]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-h1">Markets</h1>
        <p className="text-body text-muted-foreground">
          Live Kalshi contracts ranked by volume, scored against EdgeFinder's statistical model.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search markets or tickers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCcw size={14} className={isFetching ? 'animate-spin' : ''} />Refresh
        </Button>
      </div>

      {categories.length > 1 && (
        <CategoryFilter categories={categories} active={category} onChange={setCategory} />
      )}

      {isLoading ? (
        <CenteredSpinner label="Loading Kalshi markets" />
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load markets</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{(error as Error).message}</span>
            <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      ) : rows.length === 0 ? (
        <EmptyState icon={<LineChart size={20} />} title="No markets match" description="Try a different search term or category." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left text-micro uppercase tracking-wide text-muted-foreground">
                    <th className="px-6 py-3 font-normal">Market</th>
                    <th className="px-4 py-3 font-normal">Category</th>
                    <th className="px-4 py-3 text-right font-normal">Last</th>
                    <th className="px-4 py-3 text-right font-normal">Volume</th>
                    <th className="px-4 py-3 text-right font-normal">Model</th>
                    <th className="px-6 py-3 text-right font-normal">Edge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map(({ market, model, edge }) => (
                    <tr key={market.ticker} className="transition-colors hover:bg-surface-elevated">
                      <td className="px-6 py-3">
                        <Link to={`/markets/${market.ticker}`} className="block">
                          <div className="text-body text-foreground">{market.title}</div>
                          <div className="font-mono text-micro text-muted-foreground">{market.ticker}</div>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{market.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-small tabular-nums">{market.lastPrice}c</td>
                      <td className="px-4 py-3 text-right font-mono text-small tabular-nums text-muted-foreground">
                        {formatVolume(market.volume)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-small tabular-nums">{(model * 100).toFixed(1)}%</td>
                      <td className="px-6 py-3 text-right">
                        <EdgeBadge edge={edge} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
