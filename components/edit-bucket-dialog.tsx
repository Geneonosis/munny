"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BucketType = { id: number; name: string };

type Bucket = {
  id: number;
  name: string;
  currency: string;
  status: string;
  type: { id: number; name: string };
};

const STATUSES = ["active", "archived", "deactivated", "deleted"] as const;

export function EditBucketDialog({
  bucket,
  bucketTypes,
}: {
  bucket: Bucket;
  bucketTypes: BucketType[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bucket.name);
  const [typeId, setTypeId] = useState(String(bucket.type.id));
  const [currency, setCurrency] = useState(bucket.currency);
  const [status, setStatus] = useState(bucket.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleOpen(val: boolean) {
    if (val) {
      setName(bucket.name);
      setTypeId(String(bucket.type.id));
      setCurrency(bucket.currency);
      setStatus(bucket.status);
      setError(null);
    }
    setOpen(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/buckets/${bucket.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, typeId: Number(typeId), currency, status }),
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
          <DialogTitle>Edit Bucket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select value={typeId} onValueChange={(v) => v && setTypeId(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {bucketTypes.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
          />
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

