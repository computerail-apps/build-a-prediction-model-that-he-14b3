import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Candle } from '@/lib/kalshi';

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-small shadow-elev-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-mono tabular-nums text-foreground">{payload[0].value}c</div>
    </div>
  );
}

export function PriceChart({ candles }: { candles: Candle[] }) {
  const points = candles
    .filter((c) => c.closeDollars != null)
    .map((c) => ({
      time: new Date(c.endPeriodTs * 1000).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric' }),
      price: Math.round((c.closeDollars ?? 0) * 100),
    }));

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-small text-muted-foreground">
        No candlestick data in range for this market yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={32} className="fill-muted-foreground" />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" domain={[0, 100]} unit="c" width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Line type="monotone" dataKey="price" className="stroke-primary" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
