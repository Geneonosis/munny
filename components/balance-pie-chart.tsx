"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { getChartColor } from "@/lib/chart-colors";

type Bucket = {
  id: number;
  name: string;
  currentBalance: number;
  currency: string;
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: "var(--popover)",
        color: "var(--popover-foreground)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: p.payload.fill,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <span>
          {p.name}: {formatCents(p.value)}
        </span>
      </div>
    </div>
  );
}

export function BalancePieChart({ buckets }: { buckets: Bucket[] }) {
  const active = buckets.filter((b) => b.currentBalance > 0);

  const data = active.map((b, i) => ({
    name: b.name,
    value: b.currentBalance,
    fill: getChartColor(i),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
        >
          {data.map((entry, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: stable ordered list, no unique id available
            <Cell key={i} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip />} />
        <Legend
          layout="vertical"
          align="left"
          verticalAlign="middle"
          formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
          wrapperStyle={{
            maxHeight: 300,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            flexWrap: "wrap",
            columnGap: "1rem",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
