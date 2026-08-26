"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { X, Upload, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCategories } from "@/hooks/use-categories";
import { useUpdateProduct, useUploadProductImages } from "@/hooks/use-products";
import apiClient from "@/lib/api-client";
import { PageLoading } from "@/components/shared/loading";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const updateProduct = useUpdateProduct();
  const uploadImages = useUploadProductImages();

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await apiClient.get(`/products/${id}`);
        const product = res.data.data;
        setExistingImages(product.images || []);
        form.reset({
          name: product.name || "",
          description: product.description || "",
          category: product.category?.slug || "",
          price: product.price || 0,
          comparePrice: product.comparePrice || 0,
          quantity: product.quantity || 0,
          unit: product.unit || "",
          tags: product.tags || [],
          deliveryTime: product.deliveryTime || "24 hours",
          origin: product.origin || "Nigeria",
          images: [],
        });
      } catch {
        toast.error("Failed to load product");
        router.push("/dashboard/seller/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductInput) => {
    try {
      let allImages = [...existingImages];

      if (files.length > 0) {
        const newUrls = await uploadImages.mutateAsync(files);
        allImages = [...allImages, ...newUrls];
      }

      const selectedCategory = categories?.find((c) => c.slug === data.category || c.id === data.category);

      await updateProduct.mutateAsync({
        id,
        data: {
          categoryId: selectedCategory?.id || data.category,
          name: data.name,
          description: data.description,
          price: data.price,
          comparePrice: data.comparePrice || undefined,
          quantity: data.quantity || undefined,
          unit: data.unit || undefined,
          images: allImages,
          tags: data.tags || [],
          deliveryTime: data.deliveryTime,
          origin: data.origin,
        },
      });

      toast.success("Product updated!");
      router.push("/dashboard/seller/products");
    } catch (error: any) {
      toast.error("Failed to update product", { description: error?.response?.data?.message || "Something went wrong." });
    }
  };

  if (loading) return <PageLoading />;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2 gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-sm text-muted-foreground">Update your product listing</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-semibold">Product Images</h2>
            {existingImages.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-3">
                {existingImages.map((img, i) => (
                  <div key={`ex-${i}`} className="relative h-20 w-20 overflow-hidden rounded-xl">
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(i)}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
                isDragActive ? "border-brand-600 bg-brand-50 dark:bg-brand-950" : "border-muted-foreground/25 hover:border-muted-foreground/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium">Add more images</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
            {previews.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {previews.map((preview, i) => (
                  <div key={`new-${i}`} className="relative h-20 w-20 overflow-hidden rounded-xl">
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
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
                    placeholder="Describe your product..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <h2 className="font-semibold">Pricing & Stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₦)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="comparePrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>Compare Price (₦)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="unit" render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="origin" render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" size="lg" className="flex-1" disabled={updateProduct.isPending || uploadImages.isPending}>
              {(updateProduct.isPending || uploadImages.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadImages.isPending ? "Uploading..." : updateProduct.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
