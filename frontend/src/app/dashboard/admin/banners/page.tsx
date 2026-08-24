"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/modal";
import { useAdminBanners, useCreateBanner, useDeleteBanner } from "@/hooks/use-admin";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminBannersPage() {
  const { data: banners, isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const deleteBanner = useDeleteBanner();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subtitle: "", imageUrl: "", link: "" });

  const handleCreate = async () => {
    if (!form.title || !form.imageUrl) {
      toast.error("Title and image URL are required");
      return;
    }
    try {
      await createBanner.mutateAsync({ title: form.title, subtitle: form.subtitle, imageUrl: form.imageUrl, link: form.link, isActive: true });
      toast.success("Banner created");
      setForm({ title: "", subtitle: "", imageUrl: "", link: "" });
      setIsOpen(false);
    } catch {
      toast.error("Failed to create banner");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner.mutateAsync(id);
      toast.success("Banner deleted");
    } catch {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banners</h1>
          <p className="text-sm text-muted-foreground">Manage homepage banners</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" />Add Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input placeholder="Banner title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input placeholder="Banner subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div>
                <Label>Link URL (optional)</Label>
                <Input placeholder="/products or https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
              </div>
              <Button className="w-full" onClick={handleCreate} loading={createBanner.isPending}>Create Banner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted" />)}
        </div>
      ) : (banners ?? []).length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No banners yet</p>
      ) : (
        <div className="space-y-4">
          {banners?.map((banner: any) => (
            <div key={banner.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4">
              <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg">
                <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" sizes="160px" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{banner.title}</p>
                {banner.subtitle && <p className="text-sm text-muted-foreground">{banner.subtitle}</p>}
                <Badge variant={banner.isActive ? "success" : "secondary"} className="mt-2">
                  {banner.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => handleDelete(banner.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
