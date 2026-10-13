import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { fetchMarket } from '@/lib/kalshi';
import { computeModelProbability, computeEdge } from '@/lib/model';
import { Card, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Input } from '@/lib/ui/Input';
import { EmptyState } from '@/lib/ui/EmptyState';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EdgeBadge } from '@/components/EdgeBadge';
import { Star, Trash2, LogIn } from 'lucide-react';

interface WatchlistRow {
  id: string;
  ticker: string;
  title: string;
  notes: string | null;
  last_model_probability: number | null;
  last_market_probability: number | null;
  last_edge: number | null;
  last_checked_at: string | null;
}

function useUser() {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    staleTime: 60_000,
  });
}

export function WatchlistPage() {
  const qc = useQueryClient();
  const { data: user, isLoading: userLoading } = useUser();
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});

  const watchlistQuery = useQuery({
    queryKey: ['watchlist', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('build_a_prediction_m_watchlist')
        .select('id,ticker,title,notes,last_model_probability,last_market_probability,last_edge,last_checked_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as WatchlistRow[];
      const refreshed = await Promise.all(
        rows.map(async (row) => {
          try {
            const market = await fetchMarket(row.ticker);
            const model = computeModelProbability({ lastPrice: market.lastPrice, yesBid: market.yesBid, yesAsk: market.yesAsk });
            const marketProb = market.lastPrice / 100;
            const edge = computeEdge(model, marketProb);
            return { ...row, last_model_probability: model, last_market_probability: marketProb, last_edge: edge, live: true as const };
          } catch {
            return { ...row, live: false as const };
          }
        }),
      );
      return refreshed;
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('build_a_prediction_m_watchlist').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from('build_a_prediction_m_watchlist').update({ notes }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  if (userLoading) {
    return <CenteredSpinner label="Checking session" />;
  }

  if (!user) {
    return (
      <EmptyState
        icon={<LogIn size={20} />}
        title="Sign in to view your watchlist"
        description="Saved markets and their tracked edge appear here once you're signed in via Supabase auth."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-h1">Watchlist</h1>
        <p className="text-body text-muted-foreground">
          Saved markets, refreshed against live Kalshi prices on load.
        </p>
      </div>

      {watchlistQuery.isLoading ? (
        <CenteredSpinner label="Loading your watchlist" />
      ) : watchlistQuery.error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load watchlist</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{(watchlistQuery.error as Error).message}</span>
            <Button size="sm" variant="outline" onClick={() => watchlistQuery.refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      ) : !watchlistQuery.data || watchlistQuery.data.length === 0 ? (
        <EmptyState
          icon={<Star size={20} />}
          title="No saved markets yet"
          description="Browse markets and click Save to Watchlist on a market detail page."
        />
      ) : (
        <div className="space-y-4">
          {watchlistQuery.data.map((row) => (
            <Card key={row.id}>
              <CardContent className="space-y-3 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link to={`/markets/${row.ticker}`} className="text-body text-foreground transition-colors hover:text-primary">
                      {row.title}
                    </Link>
                    <div className="font-mono text-micro text-muted-foreground">{row.ticker}</div>
                    {!('live' in row) || !(row as { live?: boolean }).live ? null : null}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMutation.mutate(row.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 size={14} />Remove
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-micro uppercase tracking-wide text-muted-foreground">Model</div>
                    <div className="font-mono text-small tabular-nums">
                      {row.last_model_probability != null ? `${(row.last_model_probability * 100).toFixed(1)}%` : '--'}
                    </div>
                  </div>
                  <div>
                    <div className="text-micro uppercase tracking-wide text-muted-foreground">Market</div>
                    <div className="font-mono text-small tabular-nums">
                      {row.last_market_probability != null ? `${(row.last_market_probability * 100).toFixed(1)}%` : '--'}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-micro uppercase tracking-wide text-muted-foreground">Edge</div>
                    {row.last_edge != null ? <EdgeBadge edge={row.last_edge} /> : <span className="text-small text-muted-foreground">--</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a note"
                    value={noteDrafts[row.id] ?? row.notes ?? ''}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateNotesMutation.mutate({ id: row.id, notes: noteDrafts[row.id] ?? row.notes ?? '' })}
                    disabled={updateNotesMutation.isPending}
                  >
                    Save note
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
