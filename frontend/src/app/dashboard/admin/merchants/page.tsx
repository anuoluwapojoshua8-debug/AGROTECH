"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/dashboard/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/modal";
import { getInitials, formatDate } from "@/lib/utils";
import { Check, X, Eye, FileText, FileImage, Shield } from "lucide-react";
import { useAdminMerchants, useApproveMerchant, useRejectMerchant } from "@/hooks/use-admin";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminMerchantsPage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const { data, isLoading } = useAdminMerchants(page);
  const approveMerchant = useApproveMerchant();
  const rejectMerchant = useRejectMerchant();

  const rawItems = data?.items ?? [];
  const merchants = rawItems.map((m) => ({
    _id: m.id,
    storeName: m.businessName,
    owner: `${m.user.firstName} ${m.user.lastName}`,
    email: m.user.email,
    products: m._count?.products ?? 0,
    status: m.status?.toLowerCase(),
    createdAt: m.createdAt,
    raw: m,
  }));

  const handleApprove = async (id: string) => {
    try {
      await approveMerchant.mutateAsync(id);
      toast.success("Merchant approved");
      setSelected(null);
    } catch {
      toast.error("Failed to approve merchant");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMerchant.mutateAsync({ id });
      toast.success("Merchant rejected");
      setSelected(null);
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
      <Badge variant={m.status === "approved" || m.status === "verified" ? "success" : m.status === "pending" ? "warning" : "destructive"}>
        {m.status}
      </Badge>
    )},
    { key: "createdAt", header: "Joined", cell: (m: any) => <span className="text-sm text-muted-foreground">{formatDate(m.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      cell: (m: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setSelected(m.raw)} title="View KYC"><Eye className="h-4 w-4" /></Button>
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
        <p className="text-sm text-muted-foreground">Approve and manage merchants — review KYC documents before approval</p>
      </div>
      <DataTable columns={columns} data={merchants} searchable searchKeys={["storeName", "owner", "email"]} loading={isLoading} />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-brand-600" /> KYC — {selected.businessName}</DialogTitle>
                <DialogDescription>{selected.user?.firstName} {selected.user?.lastName} · {selected.user?.email} · {selected.user?.phone ?? ""}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div><p className="text-muted-foreground text-xs">Business address</p><p className="font-medium">{selected.businessAddress || "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{selected.businessPhone || "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">BVN</p><p className="font-mono text-xs">{selected.bvn || "—"}</p></div>
                  <div><p className="text-muted-foreground text-xs">Tax ID</p><p className="font-mono text-xs">{selected.taxId || "—"}</p></div>
                  <div className="sm:col-span-2"><p className="text-muted-foreground text-xs">Produce types</p><p>{selected.produceTypes?.join(", ") || "—"}</p></div>
                  <div className="sm:col-span-2"><p className="text-muted-foreground text-xs">Description</p><p className="text-muted-foreground">{selected.description || "—"}</p></div>
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-sm font-semibold flex items-center gap-2"><FileImage className="h-4 w-4" /> ID Document {selected.idDocumentType ? `(${selected.idDocumentType})` : ""}</p>
                  {selected.idDocument ? (
                    <a href={selected.idDocument} target="_blank" rel="noopener noreferrer" className="mt-2 block overflow-hidden rounded-lg border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selected.idDocument} alt="ID document" className="max-h-64 w-full object-contain bg-muted" />
                      <p className="p-2 text-xs text-center text-brand-600 underline">Open full image</p>
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No ID document uploaded</p>
                  )}
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-sm font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> Business Documents</p>
                  {(selected.businessDocuments || []).length ? (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {selected.businessDocuments.map((doc: string, i: number) => (
                        <a key={i} href={doc} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doc} alt={`Business doc ${i + 1}`} className="h-32 w-full object-cover bg-muted" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                          <p className="truncate p-2 text-xs text-brand-600 underline">{doc.split("/").pop()}</p>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No business documents</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => handleApprove(selected.id)} disabled={approveMerchant.isPending}><Check className="mr-2 h-4 w-4" /> Approve</Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(selected.id)} disabled={rejectMerchant.isPending}><X className="mr-2 h-4 w-4" /> Reject</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
