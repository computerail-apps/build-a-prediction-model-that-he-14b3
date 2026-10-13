import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/Card';
import type { OrderBook } from '@/lib/model';

export function OrderBookPanel({ book }: { book: OrderBook }) {
  const maxSize = Math.max(1, ...book.yes.map((l) => l.size), ...book.no.map((l) => l.size));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order book</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 text-micro uppercase tracking-wide text-muted-foreground">Bids (Yes)</div>
            <div className="space-y-1">
              {book.yes.map((level) => (
                <div key={level.price} className="relative flex items-center justify-between overflow-hidden rounded px-2 py-1">
                  <div
                    className="absolute inset-y-0 left-0 bg-success/15"
                    style={{ width: `${(level.size / maxSize) * 100}%` }}
                  />
                  <span className="relative font-mono text-small tabular-nums text-success">{level.price}c</span>
                  <span className="relative font-mono text-small tabular-nums text-muted-foreground">{level.size}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-micro uppercase tracking-wide text-muted-foreground">Asks (No)</div>
            <div className="space-y-1">
              {book.no.map((level) => (
                <div key={level.price} className="relative flex items-center justify-between overflow-hidden rounded px-2 py-1">
                  <div
                    className="absolute inset-y-0 right-0 bg-destructive/15"
                    style={{ width: `${(level.size / maxSize) * 100}%` }}
                  />
                  <span className="relative font-mono text-small tabular-nums text-destructive">{level.price}c</span>
                  <span className="relative font-mono text-small tabular-nums text-muted-foreground">{level.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
