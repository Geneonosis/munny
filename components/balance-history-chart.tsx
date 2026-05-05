"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [stacked, setStacked] = useState(false);

  if (series.length === 0 || buckets.length === 0) {
    return <p className="text-muted-foreground text-sm">No transaction history yet.</p>;
  }

  const visibleSeries = series.slice(range[0], range[1] + 1);
  const startDate = series[range[0]]?.date as string;
  const endDate = series[range[1]]?.date as string;

  function toggleBucket(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const visibleBuckets = buckets.filter((b) => !hidden.has(String(b.id)));

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {buckets.map((b, i) => {
            const id = String(b.id);
            const isHidden = hidden.has(id);
            const color = COLORS[i % COLORS.length];
            return (
              <button
                key={b.id}
                onClick={() => toggleBucket(id)}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-opacity"
                style={{ borderColor: color, opacity: isHidden ? 0.35 : 1 }}
              >
                <span
                  className="inline-block rounded-full"
                  style={{ width: 8, height: 8, background: color, flexShrink: 0 }}
                />
                {b.name}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setStacked((s) => !s)}
          className="shrink-0 rounded-full border px-3 py-0.5 text-xs"
        >
          {stacked ? "Line" : "Stacked"}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {stacked ? (
          <AreaChart data={visibleSeries}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCents(v)} tick={{ fontSize: 11 }} width={80} />
            <Tooltip formatter={(value) => [formatCents(Number(value)), ""]} />
            {visibleBuckets.map((b) => {
              const color = COLORS[buckets.indexOf(b) % COLORS.length];
              return (
                <Area
                  key={b.id}
                  type="monotone"
                  dataKey={String(b.id)}
                  name={b.name}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.5}
                  strokeWidth={1}
                  stackId="total"
                />
              );
            })}
          </AreaChart>
        ) : (
          <LineChart data={visibleSeries}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCents(v)} tick={{ fontSize: 11 }} width={80} />
            <Tooltip formatter={(value) => [formatCents(Number(value)), ""]} />
            {buckets.map((b, i) => (
              <Line
                key={b.id}
                type="monotone"
                dataKey={String(b.id)}
                name={b.name}
                stroke={COLORS[i % COLORS.length]}
                dot={false}
                strokeWidth={2}
                hide={hidden.has(String(b.id))}
              />
            ))}
          </LineChart>
        )}
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
