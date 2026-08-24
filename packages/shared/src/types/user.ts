export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  RIDER = 'RIDER',
}

export enum MerchantStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export interface IUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMerchant {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  businessLogo?: string;
  description?: string;
  status: MerchantStatus;
  commissionRate: number;
  tier: string;
  kycSubmitted: boolean;
  kycApproved: boolean;
  deliveryRadius: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAddress {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}
