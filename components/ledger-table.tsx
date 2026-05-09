"use client";

import { useState } from "react";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category = { id: number; name: string };

type Row = {
  id: number;
  amount: number;
  flow: string;
  note: string | null;
  date: string;
  categoryId: number | null;
  categoryName: string | null;
  running: number;
};

function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    cents / 100
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export function LedgerTable({
  rows,
  currency,
  availableCategories,
}: {
  rows: Row[];
  currency: string;
  availableCategories: Category[];
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const totalPages = Math.ceil(rows.length / pageSize);
  const start = page * pageSize;
  const visibleRows = rows.slice(start, start + pageSize);

  function handlePageSizeChange(val: string | null) {
    if (!val) return;
    setPageSize(Number(val));
    setPage(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground"
              >
                No transactions yet.
              </TableCell>
            </TableRow>
          )}
          {visibleRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.date}</TableCell>
              <TableCell>
                {row.note ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="capitalize">
                {row.categoryName ?? (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={row.flow === "in" ? "default" : "secondary"}>
                  {row.flow === "in" ? "In" : "Out"}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">
                {row.flow === "out" && "-"}
                {formatCents(row.amount, currency)}
              </TableCell>
              <TableCell className="font-mono">
                {formatCents(row.running, currency)}
              </TableCell>
              <TableCell>
                <EditTransactionDialog
                  row={row}
                  availableCategories={availableCategories}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select
              value={String(pageSize)}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-20 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {start + 1}–{Math.min(start + pageSize, rows.length)} of{" "}
              {rows.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
