import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SellerDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(merchantUserId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantUserId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      revenue30d,
      orders30d,
      recentOrders,
      earnings,
    ] = await Promise.all([
      this.prisma.product.count({ where: { merchantId: merchant.id } }),
      this.prisma.product.count({ where: { merchantId: merchant.id, status: 'ACTIVE' } }),
      this.prisma.order.count({ where: { merchantId: merchant.id } }),
      this.prisma.order.count({ where: { merchantId: merchant.id, status: 'PENDING' } }),
      this.prisma.order.count({ where: { merchantId: merchant.id, status: 'PROCESSING' } }),
      this.prisma.order.count({ where: { merchantId: merchant.id, status: 'DELIVERED' } }),
      this.prisma.order.aggregate({
        where: { merchantId: merchant.id, status: 'DELIVERED', createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: { merchantId: merchant.id, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.order.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          buyer: { select: { firstName: true, lastName: true } },
          items: { take: 3 },
        },
      }),
      this.prisma.earnings.aggregate({
        where: { merchantId: merchant.id },
        _sum: { amount: true },
      }),
    ]);

    const revenue7d = await this.prisma.order.aggregate({
      where: { merchantId: merchant.id, status: 'DELIVERED', createdAt: { gte: sevenDaysAgo } },
      _sum: { total: true },
    });

    const recentSales = await this.prisma.order.findMany({
      where: { merchantId: merchant.id, status: 'DELIVERED' },
      orderBy: { deliveredAt: 'desc' },
      take: 5,
      select: {
        orderNumber: true,
        total: true,
        deliveredAt: true,
        buyer: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      summary: {
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalEarnings: earnings._sum.amount || 0,
      },
      revenue: {
        last7Days: revenue7d._sum.total || 0,
        last30Days: revenue30d._sum.total || 0,
        ordersLast30Days: orders30d,
      },
      recentOrders,
      recentSales,
    };
  }

  async getSalesAnalytics(merchantUserId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly') {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantUserId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const now = new Date();
    let startDate: Date;
    const groupBy: any = {};

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const orders = await this.prisma.order.findMany({
      where: {
        merchantId: merchant.id,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        total: true,
        status: true,
        createdAt: true,
      },
    });

    const salesData: Record<string, { revenue: number; orders: number }> = {};

    for (const order of orders) {
      let key: string;
      const date = new Date(order.createdAt);

      if (period === 'daily') {
        key = date.toISOString().slice(0, 10);
      } else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = date.toISOString().slice(0, 7);
      }

      if (!salesData[key]) salesData[key] = { revenue: 0, orders: 0 };
      salesData[key].revenue += order.total;
      salesData[key].orders += 1;
    }

    return Object.entries(salesData).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }));
  }

  async getTopProducts(merchantUserId: string, limit = 10) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantUserId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const products = await this.prisma.product.findMany({
      where: { merchantId: merchant.id },
      include: {
        _count: { select: { orderItems: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { reviewCount: 'desc' },
      take: limit,
    });

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      images: p.images,
      quantity: p.quantity,
      totalSales: p._count.orderItems,
      rating: p.rating,
      reviewCount: p.reviewCount,
    }));
  }

  async getEarningsHistory(merchantUserId: string, page = 1, limit = 20) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantUserId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.earnings.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.earnings.count({ where: { merchantId: merchant.id } }),
    ]);

    const balance = await this.prisma.earnings.aggregate({
      where: { merchantId: merchant.id, status: 'pending' },
      _sum: { amount: true },
    });

    return {
      items,
      balance: balance._sum.amount || 0,
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
}
