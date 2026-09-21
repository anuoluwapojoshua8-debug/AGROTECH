"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSendOtp, useVerifyOtp } from "@/hooks/use-otp";
import { toast } from "sonner";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const [channel, setChannel] = useState<"email" | "sms">(email ? "email" : "sms");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSend = async () => {
    try {
      const res = await sendOtp.mutateAsync({
        email: channel === "email" ? email : undefined,
        phone: channel === "sms" ? phone : undefined,
        channel,
      });
      toast.success(res.message, { description: "Check Gmail / SMS. Preview code in dev: " + (res.preview?.[0]?.code || "sent") });
      if (res.preview?.[0]?.code) toast.info(`Dev preview OTP: ${res.preview[0].code}`);
      setCooldown(60);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Enter 6-digit code");
      return;
    }
    try {
      const res = await verifyOtp.mutateAsync({
        email: channel === "email" ? email : undefined,
        phone: channel === "sms" ? phone : undefined,
        code: otp,
        channel,
      });
      toast.success(res.message);
      router.push("/login");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Invalid code");
    }
  };

  if (!email && !phone) {
    return (
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">Verify your account</h1>
        <p className="text-sm text-muted-foreground">No email or phone provided. Please register first.</p>
        <Button asChild>
          <Link href="/register">Go to Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Verify your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">We sent a 6-digit code to your {channel === "email" ? "Gmail" : "phone via SMS"}</p>
        <p className="text-sm font-medium text-foreground">{channel === "email" ? email : phone}</p>
      </div>

      <Tabs value={channel} onValueChange={(v) => setChannel(v as any)}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="email" disabled={!email} className="gap-1">
            <Mail className="h-4 w-4" /> Gmail
          </TabsTrigger>
          <TabsTrigger value="sms" disabled={!phone} className="gap-1">
            <Phone className="h-4 w-4" /> SMS
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enter verification code</CardTitle>
          <p className="text-xs text-muted-foreground">Expires in 5 minutes. Check spam folder for Gmail.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-2">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono h-12"
            />
          </div>

          <Button className="w-full" onClick={handleVerify} loading={verifyOtp.isPending} disabled={otp.length !== 6}>
            Verify & Continue
          </Button>

          <div className="flex items-center justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={handleSend} disabled={cooldown > 0 || sendOtp.isPending} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${sendOtp.isPending ? "animate-spin" : ""}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" className="gap-1">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <p>• Gmail: Check inbox & spam. Sender is `noreply@agrotech.ng` via MailService.</p>
          <p>• SMS: From Twilio number `{process.env.NEXT_PUBLIC_TWILIO_NUM || "+123..."}` → your `phone`.</p>
          <p>• In dev with no SMTP/Twilio keys, code is logged to backend `[MAIL SIMULATION]` / `[SMS SIMULATION]` and returned as `preview.code`.</p>
          <p>• After verify you’ll be marked `isEmailVerified`/`isPhoneVerified` → then login.</p>
        </CardContent>
      </Card>
    </div>
  );
}
