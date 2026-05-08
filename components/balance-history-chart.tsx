"use client";

import { useState } from "react";
import { useChartStore } from "@/lib/chart-store";
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
import { getChartColor } from "@/lib/chart-colors";

type BucketMeta = { id: number; name: string };
type SeriesPoint = Record<string, number | string>;

function buildChartTooltip(series: SeriesPoint[]) {
  return function ChartTooltip({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { name: string; value: number; color: string; dataKey: string }[];
    label?: string;
  }) {
    if (!active || !payload?.length) return null;

    // Find the index of the current date in the full series (not the sliced visible series)
    const currentIdx = series.findIndex((p) => p.date === label);
    const prevPoint = currentIdx > 0 ? series[currentIdx - 1] : null;

    return (
      <div
        style={{
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "8px 12px",
          fontSize: 12,
          minWidth: 180,
        }}
      >
        <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map((p) => {
          const prev = prevPoint ? (prevPoint[p.dataKey] as number | undefined) : undefined;
          const delta = prev !== undefined ? p.value - prev : null;
          return (
            <div key={p.dataKey} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0, display: "inline-block" }} />
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCents(p.value)}</span>
              {delta !== null && delta !== 0 && (
                <span style={{ color: delta > 0 ? "#22c55e" : "#ef4444", fontVariantNumeric: "tabular-nums", minWidth: 60, textAlign: "right" }}>
                  {delta > 0 ? "+" : ""}{formatCents(delta)}
                </span>
              )}
              {delta === 0 && (
                <span style={{ color: "var(--muted-foreground)", minWidth: 60, textAlign: "right" }}>—</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };
}

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

const MAX_DAYS_PRESETS = [30, 90, 180, 365, null] as const;
type MaxDaysPreset = (typeof MAX_DAYS_PRESETS)[number];

function findIndexDaysAgo(series: SeriesPoint[], days: number): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const idx = series.findIndex((p) => (p.date as string) >= cutoffStr);
  return idx === -1 ? 0 : idx;
}

export function BalanceHistoryChart({
  buckets,
  series,
}: {
  buckets: BucketMeta[];
  series: SeriesPoint[];
}) {
  const last = Math.max(0, series.length - 1);

  // maxDays = null means "all time"
  const [maxDays, setMaxDays] = useState<MaxDaysPreset>(90);

  // Compute the earliest index the slider is allowed to reach based on maxDays
  const sliderMin = maxDays === null ? 0 : Math.max(0, findIndexDaysAgo(series, maxDays));

  // Default selection: last 30 days, clamped within sliderMin..last
  const defaultStart = Math.max(sliderMin, findIndexDaysAgo(series, 30));
  const [range, setRange] = useState<[number, number]>([defaultStart, last]);

  const [stacked, setStacked] = useState(false);
  const { hiddenBuckets, toggleBucket: storeToggle } = useChartStore();
  const hidden = new Set(hiddenBuckets);

  if (series.length === 0 || buckets.length === 0) {
    return <p className="text-muted-foreground text-sm">No transaction history yet.</p>;
  }

  function handleMaxDaysChange(preset: MaxDaysPreset) {
    setMaxDays(preset);
    const newMin = preset === null ? 0 : Math.max(0, findIndexDaysAgo(series, preset));
    // clamp current range start to the new window; keep end pinned to latest
    setRange(([, end]) => [Math.max(newMin, end > newMin ? newMin : 0), end]);
    // default the start to 30 days within the new window
    const newStart = Math.max(newMin, findIndexDaysAgo(series, 30));
    setRange([newStart, last]);
  }

  const visibleSeries = series.slice(range[0], range[1] + 1);
  const startDate = series[range[0]]?.date as string;
  const endDate = series[range[1]]?.date as string;

  function toggleBucket(id: string) {
    storeToggle(id);
  }

  const visibleBuckets = buckets.filter((b) => !hidden.has(String(b.id)));

  // Build a stable index-based color map so every bucket always gets the same unique color
  const colorMap = Object.fromEntries(buckets.map((b, i) => [String(b.id), getChartColor(i)]));

  return (
    <div className="flex flex-col gap-4">
      {/* Controls row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {buckets.map((b) => {
            const id = String(b.id);
            const isHidden = hidden.has(id);
            const color = colorMap[id];
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

      {/* Build tooltip with access to full series for delta calculation */}
      {(() => {
        const TooltipContent = buildChartTooltip(series);
        return (
      <ResponsiveContainer width="100%" height={300}>
        {stacked ? (
          <AreaChart data={visibleSeries}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => formatCents(v)} tick={{ fontSize: 11 }} width={80} />
            <Tooltip content={<TooltipContent />} />
            {visibleBuckets.map((b) => {
              const color = colorMap[String(b.id)];
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
            <Tooltip content={<TooltipContent />} />
            {buckets.map((b) => (
              <Line
                key={b.id}
                type="monotone"
                dataKey={String(b.id)}
                name={b.name}
                stroke={colorMap[String(b.id)]}
                dot={false}
                strokeWidth={2}
                hide={hidden.has(String(b.id))}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
        );
      })()}

      <div className="flex flex-col gap-1">
        <Slider
          min={sliderMin}
          max={series.length - 1}
          value={range}
          onValueChange={(v) => setRange(v as [number, number])}
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{startDate}</span>
          <div className="flex gap-1">
            {MAX_DAYS_PRESETS.map((p) => {
              const label = p === null ? "All" : `${p}d`;
              return (
                <button
                  key={label}
                  onClick={() => handleMaxDaysChange(p)}
                  className="rounded px-1.5 py-0.5 border transition-colors"
                  style={{ fontWeight: maxDays === p ? 600 : 400, opacity: maxDays === p ? 1 : 0.5 }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <span>{endDate}</span>
        </div>
      </div>
    </div>
  );
}
