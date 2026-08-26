"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { formatPrice } from "@/lib/utils";
import { useSellerProducts } from "@/hooks/use-seller";
import { useDeleteProduct } from "@/hooks/use-products";
import { Plus, Eye, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SellerProductsPage() {
  const { data, isLoading } = useSellerProducts();
  const products = data?.items ?? [];
  const deleteProduct = useDeleteProduct();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "product",
      header: "Product",
      cell: (p: any) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
            <Image src={p.images?.[0] || "/placeholder.svg"} alt={p.name} fill className="object-cover" sizes="40px" />
          </div>
          <div>
            <p className="font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.category?.name}</p>
          </div>
        </div>
      ),
    },
    { key: "price", header: "Price", cell: (p: any) => <span className="font-medium">{formatPrice(p.price)}</span> },
    { key: "quantity", header: "Stock", cell: (p: any) => <Badge variant={p.quantity > 0 ? "success" : "destructive"}>{p.quantity}</Badge> },
    { key: "status", header: "Status", cell: (p: any) => <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"}>{p.status?.toLowerCase()}</Badge> },
    {
      key: "actions",
      header: "",
      cell: (p: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/products/${p.slug}`}><Eye className="h-4 w-4" /></Link>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/dashboard/seller/products/${p.id}/edit`}><Pencil className="h-4 w-4" /></Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            onClick={() => handleDelete(p.id, p.name)}
            disabled={deletingId === p.id}
          >
            {deletingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product listings</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/seller/products/new"><Plus className="h-4 w-4" />Add Product</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={products} searchable searchKeys={["name"]} loading={isLoading} />
    </div>
  );
}
