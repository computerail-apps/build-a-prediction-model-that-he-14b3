import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/lib/ui/Card';
import { EdgeBadge } from './EdgeBadge';
import { Gauge, Target, Zap } from 'lucide-react';

export function ProbabilityCards({
  modelProb,
  marketProb,
  edge,
}: {
  modelProb: number;
  marketProb: number;
  edge: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-small">
            <Gauge size={16} />Model probability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-display tabular-nums">{(modelProb * 100).toFixed(1)}%</div>
          <CardDescription>Blend of last price, VWAP mid, and momentum</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-small">
            <Target size={16} />Market probability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="text-display tabular-nums">{(marketProb * 100).toFixed(1)}%</div>
          <CardDescription>Implied by current last traded price</CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-small">
            <Zap size={16} />Edge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <EdgeBadge edge={edge} />
          <CardDescription>
            {edge > 0
              ? 'Model sees more yes-probability than the market'
              : edge < 0
              ? 'Model sees less yes-probability than the market'
              : 'Model and market agree'}
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
