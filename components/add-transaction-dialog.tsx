"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Category = { id: number; name: string };

export function AddTransactionDialog({
  bucketId,
  availableCategories,
  currentBalance = 0,
}: {
  bucketId: number;
  availableCategories: Category[];
  currentBalance?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"transaction" | "balance">("transaction");

  // transaction mode fields
  const [amount, setAmount] = useState("");
  const [flow, setFlow] = useState("");

  // balance mode field
  const [newBalance, setNewBalance] = useState("");

  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed delta preview for balance mode
  const balanceDeltaCents = (() => {
    const parsed = parseFloat(newBalance);
    if (Number.isNaN(parsed)) return null;
    return Math.round(parsed * 100) - currentBalance;
  })();

  function resetForm() {
    setMode("transaction");
    setAmount("");
    setFlow("");
    setNewBalance("");
    setNote("");
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let cents: number;
    let resolvedFlow: string;
    let resolvedNote: string | null;

    if (mode === "balance") {
      if (balanceDeltaCents === null || balanceDeltaCents === 0) {
        setError(
          "New balance is the same as the current balance — no adjustment needed."
        );
        setLoading(false);
        return;
      }
      cents = Math.abs(balanceDeltaCents);
      resolvedFlow = balanceDeltaCents > 0 ? "in" : "out";
      resolvedNote = note || "Balance adjustment";
    } else {
      cents = Math.round(parseFloat(amount) * 100);
      resolvedFlow = flow;
      resolvedNote = note || null;
    }

    const res = await fetch("/api/ledger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bucketId,
        amount: cents,
        flow: resolvedFlow,
        note: resolvedNote,
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
    resetForm();
    router.refresh();
  }

  const currentBalanceDollars = (currentBalance / 100).toFixed(2);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger render={<Button />}>Add Transaction</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "balance" ? "Set Balance" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border overflow-hidden text-sm">
            <button
              type="button"
              className={`flex-1 py-1.5 transition-colors ${mode === "transaction" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}
              onClick={() => setMode("transaction")}
            >
              Transaction
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 transition-colors ${mode === "balance" ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-muted"}`}
              onClick={() => setMode("balance")}
            >
              Set Balance
            </button>
          </div>

          {mode === "transaction" ? (
            <>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Amount (e.g. 12.50)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Select
                value={flow}
                onValueChange={(v) => setFlow(v ?? "")}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Money In</SelectItem>
                  <SelectItem value="out">Money Out</SelectItem>
                </SelectContent>
              </Select>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                Current balance:{" "}
                <span className="font-medium">${currentBalanceDollars}</span>
              </p>
              <Input
                type="number"
                step="0.01"
                placeholder="New balance (e.g. 4500.00)"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                required
              />
              {balanceDeltaCents !== null && balanceDeltaCents !== 0 && (
                <p
                  className={`text-xs font-medium ${balanceDeltaCents > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"}`}
                >
                  {balanceDeltaCents > 0 ? "+" : ""}
                  {(balanceDeltaCents / 100).toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}{" "}
                  will be recorded as a{" "}
                  {balanceDeltaCents > 0 ? "Money In" : "Money Out"} adjustment
                </p>
              )}
              {balanceDeltaCents === 0 && newBalance !== "" && (
                <p className="text-xs text-muted-foreground">
                  No change from current balance.
                </p>
              )}
            </div>
          )}

          <Select
            value={categoryId}
            onValueChange={(v) => setCategoryId(v ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category (optional)" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder={
              mode === "balance"
                ? "Note (optional, defaults to 'Balance adjustment')"
                : "Note (optional)"
            }
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
