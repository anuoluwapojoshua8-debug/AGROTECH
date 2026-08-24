"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sellerApplicationSchema,
  type SellerApplicationInput,
} from "@/lib/validations";
import { useSellerRegistration } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Store,
  TrendingUp,
  Wallet,
  Headphones,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const benefits = [
  "Reach thousands of customers across Nigeria",
  "Set your own prices and manage your inventory",
  "Get paid directly and securely",
  "Free marketing and promotion",
  "Dedicated seller support team",
  "Real-time sales analytics",
];

const produceOptions = [
  "Vegetables",
  "Fruits",
  "Grains & Staples",
  "Dairy & Eggs",
  "Meat & Fish",
  "Beverages",
  "Spices & Herbs",
  "Other",
];

const idDocumentOptions = [
  { value: "national_id", label: "National ID Card" },
  { value: "passport", label: "International Passport" },
  { value: "driver_license", label: "Driver's License" },
  { value: "business_cac", label: "CAC Registration (Business)" },
];

export default function BecomeSellerPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [businessDocumentFiles, setBusinessDocumentFiles] = useState<File[]>([]);
  const sellerRegistration = useSellerRegistration();

  const form = useForm<SellerApplicationInput>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessAddress: "",
      businessPhone: "",
      produceTypes: [],
      businessRegistrationNumber: "",
      idDocumentType: undefined,
      acceptTerms: false,
    },
  });

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    multiple = false
  ) => {
    const files = Array.from(e.target.files || []);
    if (multiple) {
      setBusinessDocumentFiles((prev) => [...prev, ...files]);
    } else if (files[0]) {
      setIdDocumentFile(files[0]);
    }
    e.target.value = "";
  };

  const onSubmit = async (data: SellerApplicationInput) => {
    try {
      await sellerRegistration.mutateAsync({ ...data, idDocumentFile, businessDocumentFiles });
      toast.success("Your seller account is ready!", {
        description: "Your application has been submitted for review.",
      });
      router.push("/dashboard/seller");
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error?.response?.data?.message || "Something went wrong. Try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <Store className="mx-auto h-12 w-12 text-brand-600" />
        <h1 className="mt-4 text-4xl font-bold">Sell on AgroTech</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Join thousands of farmers and merchants growing their business online
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-8">
            <h2 className="text-2xl font-bold">Why Sell With Us?</h2>
            <ul className="mt-6 space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <TrendingUp className="h-8 w-8 text-brand-600" />
            <h3 className="mt-3 font-semibold">Grow Your Sales</h3>
            <p className="mt-1 text-sm text-muted-foreground">Access a large customer base actively looking for fresh produce.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Wallet className="h-8 w-8 text-brand-600" />
            <h3 className="mt-3 font-semibold">Fast Payments</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get paid within 48 hours of delivery. Secure and transparent.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6">
            <Headphones className="h-8 w-8 text-brand-600" />
            <h3 className="mt-3 font-semibold">Dedicated Support</h3>
            <p className="mt-1 text-sm text-muted-foreground">Our seller success team is here to help you every step of the way.</p>
          </div>
        </div>

        {/* Application form */}
        <div className="rounded-2xl border bg-card p-8">
          <h2 className="text-xl font-bold">Create your seller account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your store will be reviewed before going live.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 800 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+234 800 000 0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 chars, upper/lower/number/symbol"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Repeat password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold">Business details</h3>

                <div className="mt-3 space-y-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business / Farm Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Green Valley Farm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input placeholder="12 Farm Road, Ikorodu, Lagos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessRegistrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Registration Number (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="RC / BN number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="produceTypes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What do you sell?</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2">
                            {produceOptions.map((option) => (
                              <label
                                key={option}
                                className={cn(
                                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                                  field.value.includes(option)
                                    ? "border-brand-600 bg-brand-50 dark:bg-brand-950"
                                    : "border-border hover:border-muted-foreground/30"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  checked={field.value.includes(option)}
                                  onChange={() => {
                                    const next = field.value.includes(option)
                                      ? field.value.filter((v) => v !== option)
                                      : [...field.value, option];
                                    field.onChange(next);
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                                />
                                {option}
                              </label>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold">Verification documents</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional at sign-up — helps us approve your store faster.
                </p>

                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Valid ID (photo or PDF, max 5MB)</Label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      {idDocumentFile ? idDocumentFile.name : "Upload ID document"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e)}
                      />
                    </label>
                    {idDocumentFile && (
                      <button
                        type="button"
                        onClick={() => setIdDocumentFile(null)}
                        className="flex items-center gap-1 text-xs text-destructive hover:underline"
                      >
                        <X className="h-3 w-3" /> Remove {idDocumentFile.name}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Business documents (optional, max 5 files)</Label>
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm text-muted-foreground transition-colors hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      {businessDocumentFiles.length > 0
                        ? `${businessDocumentFiles.length} file(s) selected`
                        : "Upload business documents"}
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, true)}
                      />
                    </label>
                    {businessDocumentFiles.length > 0 && (
                      <div className="space-y-1">
                        {businessDocumentFiles.map((file, i) => (
                          <div key={`${file.name}-${i}`} className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-1.5 text-xs">
                            <span className="truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => setBusinessDocumentFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="idDocumentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Document Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {idDocumentOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="flex items-start gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span>
                          I agree to the{" "}
                          <Link href="/terms" className="text-brand-600 hover:underline">Terms of Service</Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>
                        </span>
                      </label>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                loading={sellerRegistration.isPending}
              >
                Start Selling <ArrowRight className="h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-brand-600 hover:underline">Sign in</Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
