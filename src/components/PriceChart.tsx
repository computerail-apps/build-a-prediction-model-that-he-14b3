import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import type { Candle } from '@/lib/model';

const PRIMARY = '#10b981';
const GRID = '#262b36';
const AXIS = '#8b93a7';

export function PriceChart({ candles }: { candles: Candle[] }) {
  const data = candles.map((c) => ({ ts: c.ts, price: Number(c.close.toFixed(1)) }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.35} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
          <XAxis
            dataKey="ts"
            tickFormatter={(v) => dayjs(v).format('HH:mm')}
            stroke={AXIS}
            tick={{ fontSize: 11, fill: AXIS }}
            minTickGap={32}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}c`}
            stroke={AXIS}
            tick={{ fontSize: 11, fill: AXIS }}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [`${value}c`, 'Close']}
            labelFormatter={(v) => dayjs(v as number).format('MMM D, HH:mm')}
            contentStyle={{ background: '#13161d', border: '1px solid #262b36', borderRadius: 8, fontSize: 12 }}
          />
          <Area type="monotone" dataKey="price" stroke={PRIMARY} fill="url(#priceFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
