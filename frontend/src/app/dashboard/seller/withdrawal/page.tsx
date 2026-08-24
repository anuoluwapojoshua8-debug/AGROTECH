"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { withdrawalSchema, type WithdrawalInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Wallet, Banknote, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { useWallet, useWalletTransactions, useWithdraw } from "@/hooks/use-seller";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SellerWithdrawalPage() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txData, isLoading: txLoading } = useWalletTransactions();
  const withdraw = useWithdraw();

  const form = useForm<WithdrawalInput>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: { amount: 0, bankName: "", accountNumber: "", accountName: "" },
  });

  const onSubmit = async (data: WithdrawalInput) => {
    try {
      await withdraw.mutateAsync({
        amount: data.amount,
        bankDetails: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountName: data.accountName,
        },
      });
      toast.success("Withdrawal request submitted!", { description: "Funds will be processed within 1-3 business days." });
      form.reset();
    } catch {
      toast.error("Failed to submit withdrawal request");
    }
  };

  const transactions = (txData?.items ?? []).filter((t: any) => t.type === "WITHDRAWAL");

  if (walletLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Withdraw Funds</h1>
          <p className="text-sm text-muted-foreground">Withdraw your earnings to your bank account</p>
        </div>

        <div className="mb-6 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-brand-600">{formatPrice(wallet?.balance ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Bank Details</h2>
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₦)</FormLabel>
                <FormControl><Input type="number" placeholder="Enter amount" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="bankName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl><Input placeholder="e.g. GTBank" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="accountNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl><Input placeholder="0123456789" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="accountName" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name</FormLabel>
                <FormControl><Input placeholder="Enter account name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" size="lg" loading={withdraw.isPending}>
              <Banknote className="mr-2 h-4 w-4" />
              Request Withdrawal
            </Button>
          </form>
        </Form>
      </div>

      <div>
        <h2 className="mb-6 text-lg font-semibold">Withdrawal History</h2>
        {txLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No withdrawal history yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((w: any) => (
              <div key={w.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    w.status === "completed" ? "bg-green-50 text-green-600 dark:bg-green-950" : "bg-yellow-50 text-yellow-600 dark:bg-yellow-950"
                  }`}>
                    {w.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{formatPrice(Math.abs(w.amount))}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(w.createdAt)}</p>
                  </div>
                </div>
                <Badge variant={w.status === "completed" || w.status === "COMPLETED" ? "success" : "warning"}>{w.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
