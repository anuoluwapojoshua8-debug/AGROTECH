"use client";

import Link from "next/link";
import { Bell, CheckCheck, Trash2, Package, CreditCard, MessageSquare, Store, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/utils";
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { useAuthStore } from "@/store/auth-store";

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

export function NotificationBell() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: unreadData } = useUnreadCount();
  const { data: notifData } = useNotifications(1, 6);
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = unreadData?.unreadCount ?? 0;
  const items = notifData?.items ?? [];

  if (!isAuthenticated) return null;

  const handleMarkAll = () => {
    if (unread > 0) markAll.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleMarkAll} disabled={markAll.isPending}>
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </Button>
            )}
            <Badge variant={unread > 0 ? "default" : "secondary"} className="text-[10px]">
              {unread} new
            </Badge>
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-[380px]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground">We&apos;ll notify you when something important happens</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markOne.mutate(n.id)}
                    className={`flex gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/50 cursor-pointer ${!n.read ? "bg-brand-50/50 dark:bg-brand-950/30" : ""}`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!n.read ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-none ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">{formatDateTime(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="h-2 w-2 shrink-0 self-center rounded-full bg-brand-600" />}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" size="sm" asChild className="w-full text-xs">
            <Link href="/dashboard/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
