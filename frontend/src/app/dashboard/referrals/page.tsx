"use client";

import { useState } from "react";
import { Gift, Copy, Users, Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useReferralCode, useGenerateReferralCode, useMyReferrals, useReferralStats, useApplyReferral } from "@/hooks/use-referrals";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { data: codeData, isLoading } = useReferralCode();
  const gen = useGenerateReferralCode();
  const { data: list } = useMyReferrals(1);
  const { data: stats } = useReferralStats();
  const apply = useApplyReferral();
  const [applyCode, setApplyCode] = useState("");
  const [copied, setCopied] = useState(false);

  const code = codeData?.code;

  const handleGenerate = async () => {
    try {
      const res = await gen.mutateAsync();
      toast.success(`Code generated: ${res.code}`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    if (!applyCode.trim()) return;
    try {
      await apply.mutateAsync(applyCode.trim());
      toast.success("Referral applied! Bonus credited");
      setApplyCode("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Invalid code");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6 text-brand-600" />
          Refer & Earn
        </h1>
        <p className="text-sm text-muted-foreground">Invite friends — you both earn wallet bonus</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Users className="h-8 w-8 text-brand-600" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalReferrals ?? 0}</p>
              <p className="text-sm text-muted-foreground">Total Invited</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Check className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats?.completedReferrals ?? 0}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <Wallet className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-2xl font-bold">{formatPrice(stats?.totalEarned ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-brand-200">
        <CardHeader>
          <CardTitle className="text-lg">Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : code ? (
            <div className="flex gap-2">
              <Input value={code} readOnly className="font-mono font-bold text-brand-600" />
              <Button variant="outline" onClick={handleCopy} className="gap-1">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          ) : (
            <Button onClick={handleGenerate} loading={gen.isPending}>
              Generate Referral Code
            </Button>
          )}
          <p className="text-xs text-muted-foreground">Share: {code ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${code}` : "Generate code first"}</p>
          <p className="text-xs text-muted-foreground">Reward: {formatPrice(stats?.rewardPerReferral ?? 500)} per successful referral</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Have a referral code?</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Enter code e.g. AGT-XXXXXX" value={applyCode} onChange={(e) => setApplyCode(e.target.value.toUpperCase())} />
          <Button onClick={handleApply} loading={apply.isPending}>
            Apply
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {(list?.items ?? []).length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">No referrals yet — start inviting!</p>
          ) : (
            <div className="space-y-3">
              {list!.items.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="text-sm font-medium">{r.referee ? `${r.referee.firstName} ${r.referee.lastName}` : r.code}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-brand-600">{formatPrice(r.rewardAmount)}</p>
                    <Badge variant={r.status === "completed" ? "success" : "secondary"} className="text-[10px]">
                      {r.status}
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
