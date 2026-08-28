"use client";

import { useState } from "react";
import { Bell, CheckCheck, Trash2, Package, CreditCard, MessageSquare, Store, Headphones, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/loading";
import { formatDateTime } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/use-notifications";
import { toast } from "sonner";

const typeIcons: Record<string, any> = {
  NEW_ORDER: Package,
  ORDER_UPDATE: Package,
  ORDER_CANCELLED: Package,
  PAYMENT: CreditCard,
  MERCHANT_APPROVED: Store,
  MERCHANT_REJECTED: Store,
  ACCOUNT_SUSPENDED: Store,
  MESSAGE: MessageSquare,
  SUPPORT: Headphones,
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page, 20);
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const delOne = useDeleteNotification();

  const notifications = (data?.items ?? []).filter((n) => (filter === "unread" ? !n.read : true));
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAll = async () => {
    try {
      await markAll.mutateAsync();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleMarkOne = async (id: string) => {
    try {
      await markOne.mutateAsync(id);
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await delOne.mutateAsync(id);
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) return <PageLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-brand-600" />
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground">
            Stay updated — {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            </TabsList>
          </Tabs>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={markAll.isPending} className="gap-1">
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Inbox className="h-12 w-12" />}
          title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
          description={filter === "unread" ? "You're all caught up!" : "We'll notify you when something important happens."}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Card key={n.id} className={`transition-all hover:shadow-md ${!n.read ? "border-brand-200 bg-brand-50/50 dark:border-brand-900 dark:bg-brand-950/20" : ""}`}>
                <CardContent className="flex gap-4 p-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${!n.read ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      {!n.read && <Badge variant="default" className="text-[10px]">New</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!n.read && (
                      <Button variant="ghost" size="icon-sm" onClick={() => handleMarkOne(n.id)} title="Mark as read">
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(n.id)} title="Delete" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} — {data.meta.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={!data.meta.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
