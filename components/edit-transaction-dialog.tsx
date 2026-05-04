"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: number; name: string };

type LedgerRow = {
  id: number;
  amount: number;
  flow: string;
  note: string | null;
  date: string;
  categoryId: number | null;
};

export function EditTransactionDialog({
  row,
  availableCategories,
}: {
  row: LedgerRow;
  availableCategories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((row.amount / 100).toFixed(2));
  const [flow, setFlow] = useState(row.flow);
  const [note, setNote] = useState(row.note ?? "");
  const [date, setDate] = useState(row.date);
  const [categoryId, setCategoryId] = useState(row.categoryId ? String(row.categoryId) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen(val: boolean) {
    if (val) {
      setAmount((row.amount / 100).toFixed(2));
      setFlow(row.flow);
      setNote(row.note ?? "");
      setDate(row.date);
      setCategoryId(row.categoryId ? String(row.categoryId) : "");
      setError(null);
    }
    setOpen(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cents = Math.round(parseFloat(amount) * 100);

    const res = await fetch(`/api/ledger/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: cents,
        flow,
        note: note || null,
        date,
        categoryId: categoryId ? Number(categoryId) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>Edit</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Amount (e.g. 12.50)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <Select value={flow} onValueChange={(v) => v && setFlow(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Money In</SelectItem>
              <SelectItem value="out">Money Out</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {availableCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

