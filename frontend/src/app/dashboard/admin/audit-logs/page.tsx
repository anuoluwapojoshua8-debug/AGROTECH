"use client";

import { useState } from "react";
import { Shield, Clock, User, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

function unwrap<T>(response: { data: { data?: T } }): T {
  return response.data.data as T;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/audit-logs?page=${page}&limit=20`);
      return unwrap<{ items: any[]; meta: any }>(res);
    },
  });

  const logs = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-600" />
          Audit Logs
        </h1>
        <p className="text-sm text-muted-foreground">Track sensitive admin actions</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <EmptyState icon={<FileText className="h-12 w-12" />} title="No audit logs" description="Actions will appear here." />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-sm font-medium">{log.entity}</span>
                    {log.entityId && <span className="text-xs font-mono text-muted-foreground">{log.entityId.slice(0, 8)}…</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(log.createdAt)} {log.userId && `· user ${log.userId.slice(0, 8)}`}
                  </p>
                  {(log.oldValue || log.newValue) && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer text-muted-foreground">Details</summary>
                      <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[11px]">{JSON.stringify({ oldValue: log.oldValue, newValue: log.newValue }, null, 2)}</pre>
                    </details>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data?.meta && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {data.meta.page} of {data.meta.totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!data.meta.hasPrev} onClick={() => setPage((p) => p - 1)}>
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
