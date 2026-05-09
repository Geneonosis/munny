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

type BucketType = { id: number; name: string; kind: string };

export function CreateBucketDialog({
  bucketTypes,
}: {
  bucketTypes: BucketType[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/buckets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, typeId: Number(typeId), currency }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    setOpen(false);
    setName("");
    setTypeId("");
    setCurrency("USD");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>New Bucket</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Bucket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            value={typeId}
            onValueChange={(value) => setTypeId(value ?? "")}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="__assets_header"
                disabled
                className="text-xs text-muted-foreground font-semibold uppercase tracking-wide"
              >
                Assets
              </SelectItem>
              {bucketTypes
                .filter((t) => t.kind === "asset")
                .map((t) => (
                  <SelectItem
                    key={t.id}
                    value={String(t.id)}
                    className="capitalize"
                  >
                    {t.name}
                  </SelectItem>
                ))}
              <SelectItem
                value="__liabilities_header"
                disabled
                className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mt-1"
              >
                Liabilities
              </SelectItem>
              {bucketTypes
                .filter((t) => t.kind === "liability")
                .map((t) => (
                  <SelectItem
                    key={t.id}
                    value={String(t.id)}
                    className="capitalize"
                  >
                    {t.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
