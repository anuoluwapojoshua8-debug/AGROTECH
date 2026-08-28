"use client";

import { useState } from "react";
import { Tag, Plus, Trash2, Edit2, Check, X, Calendar, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "@/hooks/use-coupons";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminCoupons(page);
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();
  const updateCoupon = useUpdateCoupon();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    usageLimit: "",
    expiresAt: "",
  });

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) {
      toast.error("Code and discount value are required");
      return;
    }
    try {
      await createCoupon.mutateAsync({
        code: form.code.toUpperCase(),
        description: form.description || undefined,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
        isActive: true,
      });
      toast.success(`Coupon ${form.code.toUpperCase()} created`);
      setForm({ code: "", description: "", discountType: "PERCENTAGE", discountValue: "", minOrderAmount: "", maxDiscount: "", usageLimit: "", expiresAt: "" });
      setShowForm(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create coupon");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      await deleteCoupon.mutateAsync(id);
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await updateCoupon.mutateAsync({ id, data: { isActive: !current } });
      toast.success(current ? "Coupon deactivated" : "Coupon activated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const coupons = data?.items ?? [];

  const columns = [
    { key: "code", header: "Code", cell: (c: any) => <span className="font-mono font-bold text-brand-600">{c.code}</span> },
    {
      key: "discount",
      header: "Discount",
      cell: (c: any) => (
        <Badge variant="secondary" className="gap-1">
          {c.discountType === "PERCENTAGE" ? <Percent className="h-3 w-3" /> : null}
          {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatPrice(c.discountValue)}
        </Badge>
      ),
    },
    { key: "usedCount", header: "Used", cell: (c: any) => <span className="text-sm">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</span> },
    { key: "minOrderAmount", header: "Min Order", cell: (c: any) => <span className="text-sm">{c.minOrderAmount ? formatPrice(c.minOrderAmount) : "—"}</span> },
    { key: "expiresAt", header: "Expires", cell: (c: any) => <span className="text-xs text-muted-foreground">{c.expiresAt ? formatDateTime(c.expiresAt) : "No expiry"}</span> },
    {
      key: "isActive",
      header: "Status",
      cell: (c: any) => (
        <Badge variant={c.isActive ? "success" : "secondary"}>{c.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (c: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => handleToggleActive(c.id, c.isActive)} title={c.isActive ? "Deactivate" : "Activate"}>
            {c.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(c.id, c.code)} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="h-6 w-6 text-brand-600" />
            Promo Codes
          </h1>
          <p className="text-sm text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "New Coupon"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-brand-200">
          <CardHeader>
            <CardTitle className="text-lg">Create Promo Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Discount Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Discount Value * {form.discountType === "PERCENTAGE" ? "(%)" : "(₦)"}</Label>
                <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder={form.discountType === "PERCENTAGE" ? "20" : "1000"} />
              </div>
              <div className="space-y-2">
                <Label>Min Order Amount (₦)</Label>
                <Input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="5000" />
              </div>
              {form.discountType === "PERCENTAGE" && (
                <div className="space-y-2">
                  <Label>Max Discount (₦)</Label>
                  <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="2000" />
                </div>
              )}
              <div className="space-y-2">
                <Label>Usage Limit</Label>
                <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="100" />
              </div>
              <div className="space-y-2">
                <Label>Expires At</Label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="20% off on orders above ₦5000" />
              </div>
            </div>
            <Button onClick={handleCreate} loading={createCoupon.isPending} className="w-full">
              Create Coupon
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <DataTable columns={columns} data={coupons} loading={isLoading} searchable searchKeys={["code", "description"]} />
        </CardContent>
      </Card>

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={data.meta.page >= data.meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
