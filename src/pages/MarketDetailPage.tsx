import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppData } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/lib/ui/Card';
import { Button } from '@/lib/ui/Button';
import { Badge } from '@/lib/ui/Badge';
import { CenteredSpinner } from '@/lib/ui/Spinner';
import { Alert, AlertTitle, AlertDescription } from '@/lib/ui/Alert';
import { EmptyState } from '@/lib/ui/EmptyState';
import { PriceChart } from '@/components/PriceChart';
import { OrderBookPanel } from '@/components/OrderBookPanel';
import { ProbabilityCards } from '@/components/ProbabilityCards';
import { MOCK_MARKETS, type Market } from '@/data/mockMarkets';
import { MOCK_CANDLES } from '@/data/mockCandles';
import { computeModelProbability, computeEdge, buildOrderBook, type Candle } from '@/lib/model';
import { useWatchlistStore } from '@/store/watchlistStore';
import { ArrowLeft, BookmarkPlus, BookmarkCheck, ChevronLeft } from 'lucide-react';

export function MarketDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const watchlist = useWatchlistStore();
  const isSaved = useMemo(() => watchlist.items.some((i) => i.ticker === ticker), [watchlist.items, ticker]);

  const { data: market, isLoading, error, refetch } = useAppData<Market | null>({
    key: `kalshi-market-${ticker}`,
    mock: MOCK_MARKETS.find((m) => m.ticker === ticker) ?? null,
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  const { data: candles } = useAppData<Candle[]>({
    key: `kalshi-candles-${ticker}`,
    mock: MOCK_CANDLES[ticker ?? ''] ?? [],
    fetchLive: async () => {
      throw new Error('not wired yet');
    },
  });

  if (isLoading) {
    return <CenteredSpinner label="Loading market" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Couldn't load market</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          <span>{(error as Error).message}</span>
          <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!market) {
    return (
      <EmptyState
        icon={<ChevronLeft size={20} />}
        title="Market not found"
        description="This ticker isn't in the current market list."
        action={<Link to="/markets"><Button size="sm"><ArrowLeft size={14} />Back to markets</Button></Link>}
      />
    );
  }

  const safeCandles = candles ?? [];
  const model = computeModelProbability(market.lastPrice, safeCandles);
  const marketProb = market.lastPrice / 100;
  const edge = computeEdge(model, marketProb);
  const book = buildOrderBook(market.ticker, market.yesBid, market.yesAsk);

  function handleSave() {
    if (!market) return;
    if (isSaved) {
      watchlist.remove(market.ticker);
    } else {
      watchlist.add({
        ticker: market.ticker,
        title: market.title,
        notes: null,
        last_model_probability: model,
        last_market_probability: marketProb,
        last_edge: edge,
        last_checked_at: new Date().toISOString(),
      });
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/markets" className="inline-flex items-center gap-1 text-small text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={14} />Back to markets
      </Link>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{market.category}</Badge>
            <span className="font-mono text-micro text-muted-foreground">{market.ticker}</span>
          </div>
          <h1 className="text-h1">{market.title}</h1>
          <p className="text-small text-muted-foreground">
            Closes {new Date(market.closeTime).toLocaleString()} &middot; Open interest {market.openInterest.toLocaleString()}
          </p>
        </div>
        <Button onClick={handleSave} variant={isSaved ? 'outline' : 'default'}>
          {isSaved ? <BookmarkCheck size={16} /> : <BookmarkPlus size={16} />}
          {isSaved ? 'Saved to watchlist' : 'Save to watchlist'}
        </Button>
      </div>

      <ProbabilityCards modelProb={model} marketProb={marketProb} edge={edge} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Price history</CardTitle>
              <CardDescription>Hourly candlestick closes, last 30 periods</CardDescription>
            </CardHeader>
            <CardContent>
              <PriceChart candles={safeCandles} />
            </CardContent>
          </Card>
        </div>
        <div>
          <OrderBookPanel book={book} />
        </div>
      </div>
    </div>
  );
}
