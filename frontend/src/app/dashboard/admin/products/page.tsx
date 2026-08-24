"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice } from "@/lib/utils";
import { Check, X, Eye } from "lucide-react";
import { useAdminProducts, useApproveProduct, useRejectProduct } from "@/hooks/use-admin";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminProducts(page);
  const approveProduct = useApproveProduct();
  const rejectProduct = useRejectProduct();

  const products = (data?.items ?? []).map((p) => ({
    ...p,
    image: p.images?.[0] || "/placeholder.svg",
    seller: p.merchant?.businessName || "Unknown",
    status: p.status?.toLowerCase(),
  }));

  const handleApprove = async (id: string) => {
    try {
      await approveProduct.mutateAsync(id);
      toast.success("Product approved");
    } catch {
      toast.error("Failed to approve product");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectProduct.mutateAsync(id);
      toast.success("Product rejected");
    } catch {
      toast.error("Failed to reject product");
    }
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      cell: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.seller}</p>
          </div>
        </div>
      ),
    },
    { key: "price", header: "Price", cell: (p: any) => <span className="font-medium">{formatPrice(p.price)}</span> },
    { key: "quantity", header: "Stock", cell: (p: any) => <Badge variant={p.quantity > 0 ? "success" : "destructive"}>{p.quantity}</Badge> },
    {
      key: "status",
      header: "Status",
      cell: (p: any) => (
        <Badge variant={p.status === "approved" || p.status === "ACTIVE" ? "success" : p.status === "pending" || p.status === "DRAFT" ? "warning" : "destructive"}>
          {p.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (p: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm"><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="text-green-600" onClick={() => handleApprove(p.id)}><Check className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="text-red-600" onClick={() => handleReject(p.id)}><X className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-sm text-muted-foreground">Moderate all marketplace products</p>
      </div>
      <DataTable columns={columns} data={products} searchable searchKeys={["name", "seller"]} loading={isLoading} />
    </div>
  );
}
