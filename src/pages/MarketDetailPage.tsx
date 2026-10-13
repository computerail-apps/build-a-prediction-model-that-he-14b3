import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppData } from '@/lib/data';
import { fetchMarket, fetchCandlesticks, fetchOrderbook, type Market, type Candle, type Orderbook } from '@/lib/kalshi';
import { computeModelProbability, computeEdge } from '@/lib/model';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Badge } from '@/lib/ui/Badge';
import { Button } from '@/lib/ui/Button';
import { Input } from '@/lib/ui/Input';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { ArrowLeft, Star, Check } from 'lucide-react';
import { PriceChart } from '@/components/PriceChart';
import { OrderBookPanel } from '@/components/OrderBookPanel';
import { ProbabilityCards } from '@/components/ProbabilityCards';

export function MarketDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const qc = useQueryClient();
  const [notes, setNotes] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const marketQuery = useAppData<Market>({
    key: ['kalshi-market', ticker],
    fetchLive: () => fetchMarket(ticker!),
    enabled: !!ticker,
  });

  const candlesQuery = useAppData<Candle[]>({
    key: ['kalshi-candles', ticker, marketQuery.data?.seriesTicker],
    fetchLive: () => fetchCandlesticks(marketQuery.data!.seriesTicker, ticker!),
    enabled: !!ticker && !!marketQuery.data,
  });

  const orderbookQuery = useAppData<Orderbook>({
    key: ['kalshi-orderbook', ticker],
    fetchLive: () => fetchOrderbook(ticker!),
    enabled: !!ticker,
  });

  const market = marketQuery.data;
  const model = market
    ? computeModelProbability({
        lastPrice: market.lastPrice,
        yesBid: market.yesBid,
        yesAsk: market.yesAsk,
        candles: candlesQuery.data,
      })
    : 0;
  const marketProb = market ? market.lastPrice / 100 : 0;
  const edge = market ? computeEdge(model, marketProb) : 0;

  async function handleSave() {
    if (!market) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('Sign in to save markets to your watchlist.');
      }
      const { error } = await supabase.from('build_a_prediction_m_watchlist').insert({
        user_id: userData.user.id,
        ticker: market.ticker,
        title: market.title,
        notes: notes.trim() || null,
        last_model_probability: model,
        last_market_probability: marketProb,
        last_edge: edge,
        last_checked_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSaveState('saved');
      qc.invalidateQueries({ queryKey: ['watchlist'] });
    } catch (e) {
      setSaveState('error');
      setSaveError((e as Error).message);
    }
  }

  if (marketQuery.isLoading) {
    return <CenteredSpinner label="Loading market" />;
  }

  if (marketQuery.error || !market) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn't load this market</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{(marketQuery.error as Error)?.message ?? 'Market not found.'}</span>
          <Button size="sm" variant="outline" onClick={() => marketQuery.refetch()}>Retry</Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/markets" className="inline-flex items-center gap-1 text-small text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={14} />Back to markets
      </Link>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">{market.category}</Badge>
          <span className="font-mono text-micro text-muted-foreground">{market.ticker}</span>
        </div>
        <h1 className="text-h1">{market.title}</h1>
        <p className="text-body text-muted-foreground">
          Closes {new Date(market.closeTime).toLocaleString()}
        </p>
      </div>

      <ProbabilityCards modelProbability={model} marketProbability={marketProb} edge={edge} />

      <Card>
        <CardHeader>
          <CardTitle>Price history</CardTitle>
          <CardDescription>Hourly candlestick closes over the last week.</CardDescription>
        </CardHeader>
        <CardContent>
          {candlesQuery.isLoading ? (
            <CenteredSpinner label="Loading candlesticks" />
          ) : candlesQuery.error ? (
            <Alert variant="destructive">
              <AlertTitle>Couldn't load price history</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-4">
                <span>{(candlesQuery.error as Error).message}</span>
                <Button size="sm" variant="outline" onClick={() => candlesQuery.refetch()}>Retry</Button>
              </AlertDescription>
            </Alert>
          ) : (
            <PriceChart candles={candlesQuery.data ?? []} />
          )}
        </CardContent>
      </Card>

      {orderbookQuery.isLoading ? (
        <CenteredSpinner label="Loading order book" />
      ) : orderbookQuery.error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn't load order book</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{(orderbookQuery.error as Error).message}</span>
            <Button size="sm" variant="outline" onClick={() => orderbookQuery.refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      ) : (
        <OrderBookPanel orderbook={orderbookQuery.data} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Save to watchlist</CardTitle>
          <CardDescription>Track this market's edge over time. Requires sign-in.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Optional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          {saveState === 'error' && saveError && (
            <Alert variant="destructive">
              <AlertTitle>Couldn't save</AlertTitle>
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSave} disabled={saveState === 'saving'}>
            {saveState === 'saved' ? <Check size={16} /> : <Star size={16} />}
            {saveState === 'saved' ? 'Saved to watchlist' : saveState === 'saving' ? 'Saving...' : 'Save to watchlist'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
