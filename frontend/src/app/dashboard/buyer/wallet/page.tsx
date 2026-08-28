"use client";

import { useState } from "react";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useWallet, useWalletTransactions } from "@/hooks/use-seller";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

export default function BuyerWalletPage() {
  const { data: wallet, isLoading } = useWallet();
  const { data: txData } = useWalletTransactions(1);
  const [amount, setAmount] = useState("");
  const [funding, setFunding] = useState(false);

  const handleFund = async () => {
    const val = Number(amount);
    if (!val || val < 100) {
      toast.error("Minimum funding amount is ₦100");
      return;
    }
    setFunding(true);
    try {
      // Initiate funding via wallet/fund (in prod would use Paystack inline)
      await apiClient.post("/wallet/fund", { amount: val });
      toast.success(`Wallet funded with ${formatPrice(val)}`);
      setAmount("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Funding failed");
    } finally {
      setFunding(false);
    }
  };

  const transactions = txData?.items ?? wallet?.transactions ?? [];

  if (isLoading) return <div className="p-8 animate-pulse h-64 bg-muted rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-brand-600" />
          My Wallet
        </h1>
        <p className="text-sm text-muted-foreground">Fund, pay, and track your balance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-gradient-to-br from-brand-600 to-brand-700 text-white border-0">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(wallet?.balance ?? 0)}</p>
            <p className="text-sm text-white/70 mt-1">Locked: {formatPrice(wallet?.locked ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Fund Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input type="number" placeholder="Amount (NGN)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button onClick={handleFund} disabled={funding} loading={funding}>
                Fund
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1000, 5000, 10000].map((v) => (
                <Button key={v} variant="outline" size="sm" onClick={() => setAmount(String(v))}>
                  {formatPrice(v)}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              Funding via Paystack/Flutterwave — will be verified on success
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((t: any) => (
                <div key={t.id || t.reference} className="flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${t.type === "funding" || t.amount > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                      {t.type === "funding" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{t.type?.replace(/_/g, " ") || t.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${t.type === "funding" ? "text-green-600" : ""}`}>{formatPrice(t.amount)}</p>
                    <Badge variant={t.status === "completed" ? "success" : "secondary"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
