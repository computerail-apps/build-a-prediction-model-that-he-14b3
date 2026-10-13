import { Badge } from '@/lib/ui/Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function EdgeBadge({ edge }: { edge: number }) {
  const rounded = edge.toFixed(1);
  if (edge > 2) {
    return (
      <Badge variant="success" className="gap-1 font-mono tabular-nums">
        <TrendingUp size={12} />+{rounded}pp
      </Badge>
    );
  }
  if (edge < -2) {
    return (
      <Badge variant="destructive" className="gap-1 font-mono tabular-nums">
        <TrendingDown size={12} />{rounded}pp
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 font-mono tabular-nums">
      <Minus size={12} />{rounded}pp
    </Badge>
  );
}
