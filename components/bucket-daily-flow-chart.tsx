"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { Slider } from "@/components/ui/slider";

type LedgerRow = {
  date: string;
  amount: number;
  flow: string;
};

type DayPoint = {
  date: string;
  income: number;
  spending: number; // stored as absolute (positive) value
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function FlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string | number; value?: number | string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  // payload[0] corresponds to the single Bar — grab income/spending from the DayPoint payload
  const point = (payload[0] as { payload?: DayPoint }).payload;
  if (!point) return null;
  return (
    <div
      style={{
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
        minWidth: 160,
      }}
    >
      <p style={{ marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {point.income > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#22c55e", flexShrink: 0, display: "inline-block" }} />
          <span style={{ flex: 1 }}>Income</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCents(point.income)}</span>
        </div>
      )}
      {point.spending > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#ef4444", flexShrink: 0, display: "inline-block" }} />
          <span style={{ flex: 1 }}>Spending</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatCents(point.spending)}</span>
        </div>
      )}
    </div>
  );
}

// Custom bar shape — draws income upward (green) and spending downward (red)
// from the zero line at the same x position.
function makeDualBarShape(absMax: number) {
  return function DualBarShape(props: {
    x?: number;
    y?: number;
    width?: number;
    background?: { y: number; height: number };
    payload?: DayPoint;
  }) {
    const { x = 0, width = 0, background, payload } = props;
    if (!background || !payload) return null;

    const { y: bgY, height: bgH } = background;
    const zeroY = bgY + bgH / 2; // domain is symmetric so 0 is always the midpoint
    const scale = bgH / (2 * absMax);

    const incomeH = payload.income * scale;
    const spendingH = payload.spending * scale;
    const r = 3;

    return (
      <g>
        {payload.income > 0 && (
          <path
            d={`M${x + r},${zeroY - incomeH} h${width - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${incomeH - r} h${-width} v${-(incomeH - r)} a${r},${r} 0 0 1 ${r},${-r}z`}
            fill="#22c55e"
          />
        )}
        {payload.spending > 0 && (
          <path
            d={`M${x},${zeroY} h${width} v${spendingH - r} a${r},${r} 0 0 1 ${-r},${r} h${-(width - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r} v${-(spendingH - r)}z`}
            fill="#ef4444"
          />
        )}
      </g>
    );
  };
}

function buildDailySeries(rows: LedgerRow[]): DayPoint[] {
  const map: Record<string, DayPoint> = {};
  for (const r of rows) {
    if (!map[r.date]) map[r.date] = { date: r.date, income: 0, spending: 0 };
    if (r.flow === "in") map[r.date].income += r.amount;
    else map[r.date].spending += r.amount;
  }
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

export function BucketDailyFlowChart({ rows }: { rows: LedgerRow[] }) {
  const series = buildDailySeries(rows);

  const [range, setRange] = useState<[number, number]>([
    0,
    Math.max(0, series.length - 1),
  ]);

  if (series.length === 0) {
    return <p className="text-muted-foreground text-sm">No transaction history yet.</p>;
  }

  const visible = series.slice(range[0], range[1] + 1);
  const startDate = series[range[0]]?.date;
  const endDate = series[range[1]]?.date;

  const totalIncome = visible.reduce((s, d) => s + d.income, 0);
  const totalSpending = visible.reduce((s, d) => s + d.spending, 0);
  const net = totalIncome - totalSpending;
  const ratio = totalSpending > 0 ? totalIncome / totalSpending : null;
  const ahead = net > 0;
  const daysWithActivity = visible.filter((d) => d.income > 0 || d.spending > 0).length;

  const maxIncome = Math.max(...visible.map((d) => d.income), 0);
  const maxSpending = Math.max(...visible.map((d) => d.spending), 0);
  const absMax = Math.ceil(Math.max(maxIncome, maxSpending) * 1.05);

  // Recreate shape only when absMax changes
  const DualBarShape = makeDualBarShape(absMax);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          {/* Manual legend */}
          <div className="flex gap-4 mb-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500" />
              Income
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />
              Spending
            </span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visible} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatCents(Math.abs(v))}
                tick={{ fontSize: 11 }}
                width={80}
                domain={[-absMax, absMax]}
              />
              <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
              <Tooltip content={FlowTooltip as never} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              {/* Single bar using the custom dual shape */}
              <Bar dataKey="income" shape={DualBarShape as never} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary panel */}
        <div className="flex flex-col gap-3 justify-center shrink-0 w-44 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Total Income</span>
            <span className="font-mono font-medium text-green-600 dark:text-green-400">{formatCents(totalIncome)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Total Spending</span>
            <span className="font-mono font-medium text-red-500">{formatCents(totalSpending)}</span>
          </div>
          <div className="border-t pt-3 flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Net</span>
            <span className="font-mono font-semibold" style={{ color: ahead ? "#22c55e" : net < 0 ? "#ef4444" : undefined }}>
              {net > 0 ? "+" : ""}{formatCents(net)}
            </span>
            <span className="text-xs font-medium mt-0.5" style={{ color: ahead ? "#22c55e" : net < 0 ? "#ef4444" : undefined }}>
              {net === 0 ? "Break even" : ahead ? "Came out ahead" : "In the red"}
            </span>
          </div>
          {ratio !== null && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Income / Spending</span>
              <span className="font-mono font-medium">{ratio.toFixed(2)}x</span>
              <span className="text-xs text-muted-foreground">
                {ratio >= 1
                  ? `$1 earned per $${(1 / ratio).toFixed(2)} spent`
                  : `$${ratio.toFixed(2)} earned per $1 spent`}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Active Days</span>
            <span className="font-mono font-medium">{daysWithActivity}</span>
          </div>
        </div>
      </div>

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
