import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["buyer", "seller"]),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const sellerApplicationSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must include uppercase, lowercase, a number and a special character"
      ),
    confirmPassword: z.string(),
    businessName: z.string().min(2, "Business name is required"),
    businessAddress: z.string().min(5, "Business address must be at least 5 characters"),
    businessPhone: z.string().optional(),
    produceTypes: z.array(z.string()).min(1, "Select at least one produce type"),
    businessRegistrationNumber: z.string().optional(),
    idDocumentType: z.enum(["national_id", "passport", "driver_license", "business_cac"]).optional(),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  comparePrice: z.coerce.number().optional(),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1, "Please select a unit"),
  tags: z.array(z.string()).optional(),
  deliveryTime: z.string().optional(),
  origin: z.string().optional(),
  images: z.array(z.any()).min(1, "At least one image is required"),
});

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5, "Please provide a delivery address"),
  paymentMethod: z.enum(["card", "bank_transfer", "cash_on_delivery", "paystack"]),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
});

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required"),
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  phone: z.string().min(10, "Phone number is required"),
  isDefault: z.boolean().optional(),
});

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  accountName: z.string().min(1, "Account name is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SellerApplicationInput = z.infer<typeof sellerApplicationSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
