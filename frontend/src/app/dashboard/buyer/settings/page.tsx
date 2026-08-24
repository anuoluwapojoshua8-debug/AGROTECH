"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { useBuyerProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-buyer";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function BuyerSettingsPage() {
  const { data: profile, isLoading } = useBuyerProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
    if (profile) {
      setForm({ firstName: profile.firstName || "", lastName: profile.lastName || "", phone: profile.phone || "" });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(form);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[300px] rounded-2xl" />
        <Skeleton className="h-[200px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Personal Information</h2>
          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar || ""} />
              <AvatarFallback className="text-lg bg-brand-100 text-brand-700">{getInitials(`${form.firstName} ${form.lastName}`)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={profile?.email || ""} type="email" disabled />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <Button className="mt-6" onClick={handleSaveProfile} loading={updateProfile.isPending}>Save Changes</Button>
        </div>

        <Separator />

        <div className="rounded-2xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">Change Password</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Current Password</Label>
              <Input type="password" placeholder="Enter current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" placeholder="Enter new password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            </div>
          </div>
          <Button className="mt-6" onClick={handleSavePassword} loading={changePassword.isPending}>Update Password</Button>
        </div>
      </div>
    </div>
  );
}
