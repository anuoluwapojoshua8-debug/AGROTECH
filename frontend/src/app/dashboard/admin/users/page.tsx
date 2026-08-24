"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/dashboard/data-table";
import { getInitials, formatDate } from "@/lib/utils";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useAdminUsers, useSuspendUser } from "@/hooks/use-admin";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers(page);
  const suspendUser = useSuspendUser();

  const users = (data?.items ?? []).map((u) => ({
    ...u,
    status: u.isActive ? "active" : "suspended",
  }));

  const handleSuspend = async (userId: string) => {
    try {
      await suspendUser.mutateAsync(userId);
      toast.success("User suspended");
    } catch {
      toast.error("Failed to suspend user");
    }
  };

  const columns = [
    {
      key: "name",
      header: "User",
      cell: (user: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs">{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (user: any) => <Badge variant="outline" className="capitalize">{user.role?.toLowerCase()}</Badge> },
    {
      key: "status",
      header: "Status",
      cell: (user: any) => (
        <Badge variant={user.status === "active" ? "success" : "destructive"}>{user.status}</Badge>
      ),
    },
    { key: "createdAt", header: "Joined", cell: (user: any) => <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span> },
    {
      key: "actions",
      header: "",
      cell: (user: any) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => toast.success("User role updated")}>
            <ShieldCheck className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => handleSuspend(user.id)}>
            <ShieldAlert className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage all platform users</p>
      </div>
      <DataTable columns={columns} data={users} searchable searchKeys={["firstName", "lastName", "email"]} loading={isLoading} />
    </div>
  );
}
