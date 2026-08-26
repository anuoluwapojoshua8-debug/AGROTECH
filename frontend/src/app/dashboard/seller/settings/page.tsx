"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";
import { useBuyerProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-buyer";
import { useSellerProfile, useUpdateSellerProfile, useUpdateBankDetails } from "@/hooks/use-seller";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default function SellerSettingsPage() {
  const { data: profile, isLoading } = useBuyerProfile();
  const { data: merchantProfile } = useSellerProfile();
  const updateProfile = useUpdateProfile();
  const updateMerchant = useUpdateSellerProfile();
  const updateBank = useUpdateBankDetails();
  const changePassword = useChangePassword();

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", businessName: "", businessAddress: "", description: "" });
  const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        businessName: merchantProfile?.businessName || "",
        businessAddress: merchantProfile?.businessAddress || "",
        description: (merchantProfile as any)?.description || "",
      });
    }
  }, [profile, merchantProfile]);

  useEffect(() => {
    if (merchantProfile?.bankDetails) {
      setBankForm({
        bankName: merchantProfile.bankDetails.bankName || "",
        accountNumber: merchantProfile.bankDetails.accountNumber || "",
        accountName: merchantProfile.bankDetails.accountName || "",
      });
    }
  }, [merchantProfile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ firstName: form.firstName, lastName: form.lastName, phone: form.phone });
      await updateMerchant.mutateAsync({ businessName: form.businessName, businessAddress: form.businessAddress, description: form.description });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleSavePassword = async () => {
    try {
      await changePassword.mutateAsync(passwordForm);
      toast.success("Password updated!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch {
      toast.error("Failed to update password");
    }
  };

  const handleSaveBank = async () => {
    try {
      await updateBank.mutateAsync(bankForm);
      toast.success("Banking info saved!");
    } catch {
      toast.error("Failed to save banking info");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Store Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your store profile</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Store Profile</TabsTrigger>
          <TabsTrigger value="banking">Banking</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-6">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-semibold">Store Information</h2>
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar || ""} />
                <AvatarFallback className="text-lg bg-brand-100 text-brand-700">{getInitials(form.businessName || `${form.firstName} ${form.lastName}`)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Store Name</Label>
                <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
              </div>
              <div>
                <Label>Store Description</Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="min-h-[100px] w-full rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Phone Number</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Store Address</Label>
                  <Input value={form.businessAddress} onChange={(e) => setForm({ ...form, businessAddress: e.target.value })} />
                </div>
              </div>
            </div>
            <Button className="mt-6" onClick={handleSaveProfile} loading={updateProfile.isPending || updateMerchant.isPending}>Save Changes</Button>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-semibold">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <Label>Current Password</Label>
                <Input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
              <Button onClick={handleSavePassword} loading={changePassword.isPending}>Update Password</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="banking" className="pt-6">
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Bank Account Details</h2>
            <p className="text-sm text-muted-foreground">Used for withdrawals and payouts</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Bank Name</Label>
                <Input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} placeholder="e.g. GTBank" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input value={bankForm.accountNumber} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} placeholder="0123456789" />
              </div>
            </div>
            <div>
              <Label>Account Name</Label>
              <Input value={bankForm.accountName} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} placeholder="Enter account name" />
            </div>
            <Button onClick={handleSaveBank} disabled={updateBank.isPending}>
              {updateBank.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Banking Info
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
