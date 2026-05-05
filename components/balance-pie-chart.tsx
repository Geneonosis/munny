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

  const data = active.map((b) => ({
    name: b.name,
    value: b.currentBalance,
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
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
          <Tooltip formatter={(value) => [formatCents(Number(value)), ""]} />
        <Legend
          layout="vertical"
          align="left"
          verticalAlign="middle"
          formatter={(value) => (
            <span style={{ fontSize: 11 }}>{value}</span>
          )}
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

