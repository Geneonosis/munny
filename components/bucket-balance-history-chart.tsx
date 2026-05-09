"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Slider } from "@/components/ui/slider";

type BalancePoint = { date: string; balance: number };

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function BucketTooltip({
  series,
  active,
  payload,
  label,
}: {
  series: BalancePoint[];
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
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
        const prev = prevPoint ? prevPoint.balance : undefined;
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
}

export function BucketBalanceHistoryChart({ series }: { series: BalancePoint[] }) {
  const [range, setRange] = useState<[number, number]>([0, Math.max(0, series.length - 1)]);

  if (series.length === 0) {
    return <p className="text-muted-foreground text-sm">No transaction history yet.</p>;
  }

  const visible = series.slice(range[0], range[1] + 1);
  const startDate = series[range[0]]?.date;
  const endDate = series[range[1]]?.date;

  const minValue = Math.min(...visible.map((p) => p.balance));
  const maxValue = Math.max(...visible.map((p) => p.balance));
  // Only floor the y-axis to the min value when the range doesn't include zero,
  // giving a clearer sense of growth on accounts that never dip to zero.
  const yMin = minValue > 0 ? Math.floor(minValue * 0.995) : undefined;
  const yMax = Math.ceil(maxValue * 1.005);

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={visible}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={formatCents}
            tick={{ fontSize: 11 }}
            width={80}
            domain={[yMin ?? "auto", yMax]}
          />
          <Tooltip content={(props) => <BucketTooltip series={series} active={props.active} payload={props.payload as unknown as { name: string; value: number; color: string; dataKey: string }[] | undefined} label={props.label as string | undefined} />} />
          <Line
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke="var(--chart-1)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>

      {series.length > 1 && (
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
      )}
    </div>
  );
}
