import { Card, CardHeader, CardTitle, CardContent } from '@/lib/ui/Card';
import { EdgeBadge } from '@/components/EdgeBadge';

interface ProbabilityCardsProps {
  modelProbability: number;
  marketProbability: number;
  edge: number;
}

export function ProbabilityCards({ modelProbability, marketProbability, edge }: ProbabilityCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-small text-muted-foreground">Model probability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-h2 tabular-nums text-foreground">{(modelProbability * 100).toFixed(1)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-small text-muted-foreground">Market-implied</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-h2 tabular-nums text-foreground">{(marketProbability * 100).toFixed(1)}%</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-small text-muted-foreground">Edge</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <EdgeBadge edge={edge} className="text-body px-3 py-1" />
        </CardContent>
      </Card>
    </div>
  );
}
