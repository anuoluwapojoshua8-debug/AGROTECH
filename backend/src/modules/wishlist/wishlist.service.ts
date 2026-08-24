import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const items = await this.prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            unit: true,
            rating: true,
            reviewCount: true,
            status: true,
            merchant: {
              select: { businessName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items;
  }

  async addItem(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) throw new ConflictException('Product already in wishlist');

    return this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            unit: true,
            rating: true,
          },
        },
      },
    });
  }

  async removeItem(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!item) throw new NotFoundException('Wishlist item not found');

    await this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    return { message: 'Removed from wishlist' };
  }

  async isInWishlist(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    return { isInWishlist: !!item };
  }
}
