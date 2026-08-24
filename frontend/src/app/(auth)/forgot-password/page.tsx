"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { useForgotPassword } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const forgotMutation = useForgotPassword();

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotMutation.mutateAsync(data.email);
      setSent(true);
      toast.success("Reset link sent!", {
        description: "Check your email for password reset instructions.",
      });
    } catch (error: any) {
      toast.error("Failed to send reset link", {
        description: error?.response?.data?.message || "Email not found.",
      });
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900">
            <CheckCircle2 className="h-8 w-8 text-brand-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="text-muted-foreground">
          We&apos;ve sent a password reset link to your email. Please check your inbox and follow the instructions.
        </p>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/login">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot Password?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="you@example.com" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={forgotMutation.isPending}
          >
            Send Reset Link
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button variant="link" asChild>
          <Link href="/login" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </Button>
      </div>
    </div>
  );
}
