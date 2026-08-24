export enum ProductTag {
  FRESH = 'FRESH',
  ORGANIC = 'ORGANIC',
  FROZEN = 'FROZEN',
  IN_STOCK = 'IN_STOCK',
  BEST_SELLER = 'BEST_SELLER',
  NEW_ARRIVAL = 'NEW_ARRIVAL',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PENDING_REVIEW = 'PENDING_REVIEW',
  REJECTED = 'REJECTED',
}

export interface IProduct {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  quantity: number;
  unit: string;
  images: string[];
  tags: ProductTag[];
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  origin?: string;
  isOrganic: boolean;
  isFresh: boolean;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: ICategory[];
  productCount?: number;
}

export interface IProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}
