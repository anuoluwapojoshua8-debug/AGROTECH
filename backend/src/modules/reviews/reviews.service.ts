import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new ForbiddenException('You can only review your own orders');
    if (order.status !== 'DELIVERED') throw new BadRequestException('Can only review delivered orders');

    const orderItem = order.items.find((item) => item.productId === dto.productId);
    if (!orderItem) throw new BadRequestException('Product not found in this order');

    const existing = await this.prisma.review.findUnique({
      where: { userId_productId_orderId: { userId, productId: dto.productId, orderId: dto.orderId } },
    });

    if (existing) throw new BadRequestException('You have already reviewed this product for this order');

    const review = await this.prisma.review.create({
      data: {
        productId: dto.productId,
        userId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images || [],
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    await this.updateProductRating(dto.productId);

    return review;
  }

  async getProductReviews(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total, aggregate] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { productId } }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      ratingSummary: {
        average: aggregate._avg.rating || 0,
        total: aggregate._count.rating,
      },
    };
  }

  async getMyReviews(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('You can only delete your own reviews');

    const productId = review.productId;
    await this.prisma.review.delete({ where: { id: reviewId } });

    await this.updateProductRating(productId);

    return { message: 'Review deleted successfully' };
  }

  private async updateProductRating(productId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggregate._avg.rating || 0,
        reviewCount: aggregate._count,
      },
    });
  }
}
