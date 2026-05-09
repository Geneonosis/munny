"use client";

import { ResponsiveSankey } from "@nivo/sankey";
import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LedgerRow = {
  id: number;
  amount: number;
  flow: string;
  date: string;
  categoryName: string | null;
};

function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function getAvailableMonths(rows: LedgerRow[]): string[] {
  const set = new Set<string>();
  for (const r of rows) set.add(r.date.slice(0, 7));
  return Array.from(set).sort().reverse();
}

function buildSankeyData(rows: LedgerRow[], month: string) {
  const monthRows = rows.filter((r) => r.date.startsWith(month));

  const totalIncome = monthRows
    .filter((r) => r.flow === "in")
    .reduce((s, r) => s + r.amount, 0);

  const outflowByCategory: Record<string, number> = {};
  for (const r of monthRows.filter((r) => r.flow === "out")) {
    const cat = r.categoryName ?? "Uncategorized";
    outflowByCategory[cat] = (outflowByCategory[cat] ?? 0) + r.amount;
  }

  const totalOutflows = Object.values(outflowByCategory).reduce(
    (s, v) => s + v,
    0
  );

  if (totalIncome === 0 && totalOutflows === 0) return null;

  const surplus = totalIncome - totalOutflows;
  const hasDeficit = surplus < 0;
  const deficitAmount = hasDeficit ? -surplus : 0;

  const categoryNames = Object.keys(outflowByCategory);
  const nodes: { id: string }[] = [];
  const links: { source: string; target: string; value: number }[] = [];

  // Build source nodes
  nodes.push({ id: "Income" });
  if (hasDeficit) nodes.push({ id: "Deficit" });

  // Build category sink nodes
  for (const cat of categoryNames) {
    nodes.push({ id: cat });
  }

  // Surplus goes to Retained
  if (!hasDeficit && surplus > 0) {
    nodes.push({ id: "Retained" });
  }

  if (hasDeficit && totalOutflows > 0) {
    // Distribute Income and Deficit proportionally across categories
    for (const cat of categoryNames) {
      const catAmount = outflowByCategory[cat];
      const incomeShare = Math.round(totalIncome * (catAmount / totalOutflows));
      const defShare = catAmount - incomeShare;
      if (incomeShare > 0)
        links.push({ source: "Income", target: cat, value: incomeShare });
      if (defShare > 0)
        links.push({ source: "Deficit", target: cat, value: defShare });
    }
  } else {
    for (const cat of categoryNames) {
      links.push({
        source: "Income",
        target: cat,
        value: outflowByCategory[cat],
      });
    }
    if (surplus > 0) {
      links.push({ source: "Income", target: "Retained", value: surplus });
    }
  }

  return { nodes, links, totalIncome, totalOutflows, deficitAmount };
}

// Stable set of named node colors — bright enough for both light and dark
const NAMED_COLORS: Record<string, string> = {
  Income: "var(--chart-1)",
  Retained: "var(--chart-2)",
  Deficit: "var(--chart-5)",
};

const CATEGORY_PALETTE = [
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
];

export function LedgerSankeyChart({ rows }: { rows: LedgerRow[] }) {
  const months = useMemo(() => getAvailableMonths(rows), [rows]);
  const [selectedMonth, setSelectedMonth] = useState(months[0] ?? "");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const result = useMemo(
    () => (selectedMonth ? buildSankeyData(rows, selectedMonth) : null),
    [rows, selectedMonth]
  );

  if (months.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No transactions recorded yet.
      </p>
    );
  }

  const categoryNodes =
    result?.nodes
      .filter(
        (n) => n.id !== "Income" && n.id !== "Deficit" && n.id !== "Retained"
      )
      .map((n) => n.id) ?? [];

  const nodeColorMap: Record<string, string> = { ...NAMED_COLORS };
  categoryNodes.forEach((name, i) => {
    nodeColorMap[name] = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Select
          value={selectedMonth}
          onValueChange={(v) => v && setSelectedMonth(v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m} value={m}>
                {new Date(`${m}-01`).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {result && result.deficitAmount > 0 && (
          <span className="text-sm text-destructive font-medium">
            Deficit: {formatCents(result.deficitAmount)}
          </span>
        )}
      </div>

      {!result ? (
        <p className="text-muted-foreground text-sm">
          No transactions recorded for this period.
        </p>
      ) : result.nodes.length < 2 || result.links.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Not enough data to render flow chart.
        </p>
      ) : (
        <div style={{ height: 300 }}>
          <ResponsiveSankey
            data={result}
            margin={{ top: 8, right: 120, bottom: 8, left: 120 }}
            align="justify"
            colors={(node) => nodeColorMap[node.id] ?? "var(--chart-3)"}
            nodeOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeSpacing={24}
            nodeBorderWidth={0}
            linkOpacity={isDark ? 0.6 : 0.35}
            linkBlendMode={isDark ? "screen" : "multiply"}
            enableLinkGradient
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={10}
            label={(node) => `${node.id} · ${formatCents(node.value)}`}
            labelTextColor={isDark ? "#f9fafb" : "#111827"}
            theme={{
              labels: {
                text: { fontSize: 11, fill: isDark ? "#f9fafb" : "#111827" },
              },
              tooltip: {
                container: {
                  background: isDark ? "#1f2937" : "#ffffff",
                  color: isDark ? "#f9fafb" : "#111827",
                  fontSize: 12,
                  border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
