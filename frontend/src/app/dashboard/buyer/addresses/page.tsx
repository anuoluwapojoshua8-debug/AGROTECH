"use client";

import { useState } from "react";
import { MapPin, Plus, Trash2, Star, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  phone: string;
  isDefault: boolean;
}

function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await apiClient.get("/users/addresses");
      return unwrap<Address[]>(res);
    },
  });
}

function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Address, "id">) => {
      const res = await apiClient.post("/users/addresses", data);
      return unwrap<Address>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/addresses/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

function useSetDefaultAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.put(`/users/addresses/${id}`, { isDefault: true });
      return unwrap<Address>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export default function BuyerAddressesPage() {
  const { data: addresses, isLoading } = useAddresses();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", street: "", city: "", state: "", phone: "" });

  const handleAdd = async () => {
    if (!form.label || !form.street || !form.city || !form.state || !form.phone) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addAddress.mutateAsync({ ...form, isDefault: addresses?.length === 0 });
      toast.success("Address added!");
      setForm({ label: "", street: "", city: "", state: "", phone: "" });
      setShowForm(false);
    } catch {
      toast.error("Failed to add address");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await deleteAddress.mutateAsync(id);
      toast.success("Address deleted");
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault.mutateAsync(id);
      toast.success("Default address updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  if (isLoading) return <PageLoading />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-sm text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Address"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl border bg-card p-6 space-y-4">
          <h2 className="font-semibold">New Address</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Home, Office" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08012345678" />
            </div>
          </div>
          <div>
            <Label>Street Address</Label>
            <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} placeholder="123 Main Street" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Lagos" />
            </div>
            <div>
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="Lagos State" />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={addAddress.isPending}>
            {addAddress.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Address
          </Button>
        </div>
      )}

      {!addresses?.length ? (
        <EmptyState
          icon={<MapPin className="h-16 w-16" />}
          title="No addresses saved"
          description="Add a delivery address to make checkout faster."
          action={{ label: "Add Address", href: "#", onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`flex items-start gap-4 rounded-2xl border bg-card p-4 transition-all ${
                addr.isDefault ? "ring-2 ring-brand-600" : ""
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{addr.label}</p>
                  {addr.isDefault && <Badge variant="success">Default</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {addr.street}, {addr.city}, {addr.state}
                </p>
                <p className="text-xs text-muted-foreground">{addr.phone}</p>
              </div>
              <div className="flex items-center gap-1">
                {!addr.isDefault && (
                  <Button variant="ghost" size="icon-sm" onClick={() => handleSetDefault(addr.id)} title="Set as default">
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => handleDelete(addr.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
