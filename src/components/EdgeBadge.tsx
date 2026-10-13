import { Badge } from '@/lib/ui/Badge';
import { cn } from '@/lib/cn';

export function EdgeBadge({ edge, className }: { edge: number; className?: string }) {
  const pct = edge * 100;
  const magnitude = Math.abs(pct);
  const variant = magnitude < 1.5 ? 'outline' : pct > 0 ? 'success' : 'destructive';
  const sign = pct > 0 ? '+' : '';
  return (
    <Badge variant={variant} className={cn('font-mono tabular-nums', className)}>
      {sign}
      {pct.toFixed(1)}%
    </Badge>
  );
}
