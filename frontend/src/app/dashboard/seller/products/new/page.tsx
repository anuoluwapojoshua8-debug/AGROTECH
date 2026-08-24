"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { useDropzone } from "react-dropzone";
import { X, Upload, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const categories = [
  { value: "fresh-vegetables", label: "Fresh Vegetables" },
  { value: "organic-fruits", label: "Organic Fruits" },
  { value: "meat-poultry", label: "Meat & Poultry" },
  { value: "dairy-eggs", label: "Dairy & Eggs" },
  { value: "fresh-fish", label: "Fresh Fish" },
  { value: "grains-staples", label: "Grains & Staples" },
  { value: "beverages", label: "Beverages" },
];

const units = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "g", label: "Gram (g)" },
  { value: "basket", label: "Basket" },
  { value: "bunch", label: "Bunch" },
  { value: "crate", label: "Crate" },
  { value: "piece", label: "Piece" },
  { value: "bag", label: "Bag" },
  { value: "liter", label: "Liter" },
];

const tags = ["Fresh", "Organic", "Frozen", "Premium", "Local"];

export default function NewProductPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      comparePrice: 0,
      quantity: 0,
      unit: "",
      tags: [],
      deliveryTime: "24 hours",
      origin: "Nigeria",
      images: [],
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 5,
  });

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductInput) => {
    try {
      // Simulate API call
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Product created!", { description: "Your product has been listed successfully." });
      router.push("/dashboard/seller/products");
    } catch (error: any) {
      toast.error("Failed to create product", { description: error?.message || "Something went wrong." });
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-sm text-muted-foreground">List your farm produce for sale</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Images */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-semibold">Product Images</h2>
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
                isDragActive ? "border-brand-600 bg-brand-50 dark:bg-brand-950" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Drag & drop images here</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB (max 5 images)</p>
            </div>
            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((preview, i) => (
                  <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl">
                    <Image src={preview} alt="" fill className="object-cover" sizes="80px" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Fresh Organic Tomatoes" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    className="min-h-[120px] w-full rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Describe your product, its origin, quality, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Pricing & Stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₦)</FormLabel>
                  <FormControl><Input type="number" placeholder="2500" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="comparePrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Compare Price (₦)</FormLabel>
                  <FormControl><Input type="number" placeholder="3500" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl><Input type="number" placeholder="50" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          {/* Tags & Details */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Product Details</h2>
            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = (field.value || []).includes(tag);
                      return (
                        <Badge
                          key={tag}
                          variant={selected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            field.onChange(selected ? current.filter((t) => t !== tag) : [...current, tag]);
                          }}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="deliveryTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Time</FormLabel>
                  <FormControl><Input placeholder="e.g. 24 hours" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="origin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl><Input placeholder="e.g. Oyo State, Nigeria" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" size="lg" className="flex-1">Create Product</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
