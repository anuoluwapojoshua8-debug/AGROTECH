"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data: Array<{ name: string; revenue: number; orders: number }>;
  className?: string;
}

export function SalesChart({ data, className }: SalesChartProps) {
  const [view, setView] = useState<"revenue" | "orders">("revenue");

  const formatNaira = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className={cn("rounded-2xl border bg-card p-6", className)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Sales Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly performance</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <Button
            variant={view === "revenue" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("revenue")}
            className="h-8"
          >
            Revenue
          </Button>
          <Button
            variant={view === "orders" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("orders")}
            className="h-8"
          >
            Orders
          </Button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {view === "revenue" ? (
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNaira}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
                formatter={(value: number) => [formatNaira(value), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                }}
              />
              <Bar dataKey="orders" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
