"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Bucket = { id: number; name: string; currentBalance: number; currency: string };

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function BalancePieChart({ buckets }: { buckets: Bucket[] }) {
  const active = buckets.filter((b) => b.currentBalance > 0);
  const total = active.reduce((sum, b) => sum + b.currentBalance, 0);

  const data = active.map((b) => ({
    name: b.name,
    value: b.currentBalance,
    pct: total > 0 ? ((b.currentBalance / total) * 100).toFixed(1) : "0",
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
          label={({ name, pct }) => `${name} ${pct}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [formatCents(value), name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

