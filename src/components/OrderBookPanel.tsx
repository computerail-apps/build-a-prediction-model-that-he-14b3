import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/Card';
import { EmptyState } from '@/lib/ui/EmptyState';
import { BookOpen } from 'lucide-react';
import type { Orderbook } from '@/lib/kalshi';

export function OrderBookPanel({ orderbook }: { orderbook: Orderbook | undefined }) {
  const hasData = !!orderbook && (orderbook.yes.length > 0 || orderbook.no.length > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order book</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <EmptyState
            icon={<BookOpen size={20} />}
            title="No open orders"
            description="This market currently has no resting orders in the book."
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-2 text-micro uppercase tracking-wide text-muted-foreground">Yes bids</div>
              <div className="space-y-1">
                {orderbook!.yes.slice(0, 8).map((l, i) => (
                  <div key={`${l.priceCents}-${i}`} className="flex items-center justify-between rounded bg-success/10 px-2 py-1">
                    <span className="font-mono text-small tabular-nums text-success">{l.priceCents}c</span>
                    <span className="font-mono text-small tabular-nums text-muted-foreground">{l.size.toFixed(0)}</span>
                  </div>
                ))}
                {orderbook!.yes.length === 0 && (
                  <div className="text-small text-muted-foreground">No yes bids</div>
                )}
              </div>
            </div>
            <div>
              <div className="mb-2 text-micro uppercase tracking-wide text-muted-foreground">No bids</div>
              <div className="space-y-1">
                {orderbook!.no.slice(0, 8).map((l, i) => (
                  <div key={`${l.priceCents}-${i}`} className="flex items-center justify-between rounded bg-destructive/10 px-2 py-1">
                    <span className="font-mono text-small tabular-nums text-destructive">{l.priceCents}c</span>
                    <span className="font-mono text-small tabular-nums text-muted-foreground">{l.size.toFixed(0)}</span>
                  </div>
                ))}
                {orderbook!.no.length === 0 && (
                  <div className="text-small text-muted-foreground">No "no" bids</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
