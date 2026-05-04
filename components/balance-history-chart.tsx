"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Slider } from "@/components/ui/slider";

type BucketMeta = { id: number; name: string };
type SeriesPoint = Record<string, number | string>;

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function BalanceHistoryChart({
  buckets,
  series,
}: {
  buckets: BucketMeta[];
  series: SeriesPoint[];
}) {
  const [range, setRange] = useState<[number, number]>([0, Math.max(0, series.length - 1)]);

  if (series.length === 0 || buckets.length === 0) {
    return <p className="text-muted-foreground text-sm">No transaction history yet.</p>;
  }

  const visibleSeries = series.slice(range[0], range[1] + 1);
  const startDate = series[range[0]]?.date as string;
  const endDate = series[range[1]]?.date as string;

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={visibleSeries}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v) => formatCents(v)} tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(value) => [formatCents(Number(value)), ""]} />
          <Legend />
          {buckets.map((b, i) => (
            <Line
              key={b.id}
              type="monotone"
              dataKey={String(b.id)}
              name={b.name}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="flex flex-col gap-1">
        <Slider
          min={0}
          max={series.length - 1}
          value={range}
          onValueChange={(v) => setRange(v as [number, number])}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{startDate}</span>
          <span>{endDate}</span>
        </div>
      </div>
    </div>
  );
}

