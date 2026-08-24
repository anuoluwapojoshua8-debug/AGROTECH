"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/dashboard/data-table";
import { getInitials, formatPrice, formatDate } from "@/lib/utils";
import { Check, X, Ban } from "lucide-react";
import { useAdminMerchants, useApproveMerchant, useRejectMerchant } from "@/hooks/use-admin";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminMerchantsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminMerchants(page);
  const approveMerchant = useApproveMerchant();
  const rejectMerchant = useRejectMerchant();

  const merchants = (data?.items ?? []).map((m) => ({
    _id: m.id,
    storeName: m.businessName,
    owner: `${m.user.firstName} ${m.user.lastName}`,
    email: m.user.email,
    products: m._count?.products ?? 0,
    status: m.status?.toLowerCase(),
    createdAt: m.createdAt,
  }));

  const handleApprove = async (id: string) => {
    try {
      await approveMerchant.mutateAsync(id);
      toast.success("Merchant approved");
    } catch {
      toast.error("Failed to approve merchant");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMerchant.mutateAsync({ id });
      toast.success("Merchant rejected");
    } catch {
      toast.error("Failed to reject merchant");
    }
  };

  const columns = [
    {
      key: "store",
      header: "Merchant",
      cell: (m: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-brand-100 text-brand-700">{getInitials(m.storeName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{m.storeName}</p>
            <p className="text-xs text-muted-foreground">{m.owner} · {m.email}</p>
          </div>
        </div>
      ),
    },
    { key: "products", header: "Products", cell: (m: any) => <span>{m.products}</span> },
    { key: "status", header: "Status", cell: (m: any) => (
      <Badge variant={m.status === "approved" || m.status === "ACTIVE" ? "success" : m.status === "pending" || m.status === "PENDING" ? "warning" : "destructive"}>
        {m.status}
      </Badge>
    )},
    { key: "createdAt", header: "Joined", cell: (m: any) => <span className="text-sm text-muted-foreground">{formatDate(m.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      cell: (m: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" className="text-green-600" onClick={() => handleApprove(m._id)}><Check className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon-sm" className="text-red-600" onClick={() => handleReject(m._id)}><X className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Merchants</h1>
        <p className="text-sm text-muted-foreground">Approve and manage merchants</p>
      </div>
      <DataTable columns={columns} data={merchants} searchable searchKeys={["storeName", "owner", "email"]} loading={isLoading} />
    </div>
  );
}
