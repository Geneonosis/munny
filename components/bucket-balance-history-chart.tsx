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

export function BucketBalanceHistoryChart({ series }: { series: BalancePoint[] }) {
  const [range, setRange] = useState<[number, number]>([0, Math.max(0, series.length - 1)]);

  if (series.length === 0) {
    return <p className="text-muted-foreground text-sm">No transaction history yet.</p>;
  }

  const visible = series.slice(range[0], range[1] + 1);
  const startDate = series[range[0]]?.date;
  const endDate = series[range[1]]?.date;

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={visible}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={formatCents} tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(v) => [formatCents(Number(v)), "Balance"]} />
          <Line
            type="monotone"
            dataKey="balance"
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

