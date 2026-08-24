import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers,
      totalMerchants,
      newMerchants,
      totalProducts,
      newProducts,
      totalOrders,
      newOrders,
      revenue,
      newRevenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: start, lte: now } } }),
      this.prisma.merchant.count(),
      this.prisma.merchant.count({ where: { createdAt: { gte: start, lte: now } } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { createdAt: { gte: start, lte: now } } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { createdAt: { gte: start, lte: now } } }),
      this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', createdAt: { gte: start, lte: now } },
        _sum: { amount: true },
      }),
    ]);

    return {
      period: { start, end: now },
      users: { total: totalUsers, new: newUsers },
      merchants: { total: totalMerchants, new: newMerchants },
      products: { total: totalProducts, new: newProducts },
      orders: {
        total: totalOrders,
        new: newOrders,
        conversionRate: totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(2) : '0',
      },
      revenue: {
        total: revenue._sum.amount || 0,
        new: newRevenue._sum.amount || 0,
        averageOrderValue: totalOrders > 0 ? ((revenue._sum.amount || 0) / totalOrders).toFixed(2) : '0',
      },
    };
  }

  async getRevenueAnalytics(period: 'daily' | 'weekly' | 'monthly' = 'monthly', limit = 12) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - limit * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - limit * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - limit * 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const payments = await this.prisma.payment.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: startDate },
      },
      select: { amount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const revenueData: Record<string, number> = {};

    for (const payment of payments) {
      const date = new Date(payment.createdAt);
      let key: string;

      if (period === 'daily') key = date.toISOString().slice(0, 10);
      else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = date.toISOString().slice(0, 7);
      }

      revenueData[key] = (revenueData[key] || 0) + payment.amount;
    }

    return Object.entries(revenueData).map(([date, amount]) => ({ date, amount }));
  }

  async getUserGrowth(period: 'daily' | 'weekly' | 'monthly' = 'monthly', limit = 12) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - limit * 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - limit * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - limit * 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    const growthData: Record<string, { total: number; buyers: number; sellers: number }> = {};

    for (const user of users) {
      const date = new Date(user.createdAt);
      let key: string;

      if (period === 'daily') key = date.toISOString().slice(0, 10);
      else if (period === 'weekly') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = date.toISOString().slice(0, 7);
      }

      if (!growthData[key]) growthData[key] = { total: 0, buyers: 0, sellers: 0 };
      growthData[key].total += 1;
      if (user.role === 'BUYER' || user.role === 'SELLER') {
        if (user.role === 'SELLER') growthData[key].sellers += 1;
        else growthData[key].buyers += 1;
      }
    }

    return Object.entries(growthData).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getTopProducts(limit = 20, startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          status: 'DELIVERED',
          createdAt: { gte: start, lte: now },
        },
      },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        totalPrice: true,
        product: {
          select: {
            images: true,
            slug: true,
            merchant: { select: { businessName: true } },
          },
        },
      },
    });

    const productMap: Record<string, { name: string; slug: string; images: string[]; merchant: string; quantitySold: number; revenue: number; orderCount: number }> = {};

    for (const item of orderItems) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          name: item.productName,
          slug: item.product.slug,
          images: item.product.images,
          merchant: item.product.merchant.businessName,
          quantitySold: 0,
          revenue: 0,
          orderCount: 0,
        };
      }
      productMap[item.productId].quantitySold += item.quantity;
      productMap[item.productId].revenue += item.totalPrice;
      productMap[item.productId].orderCount += 1;
    }

    return Object.entries(productMap)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  async getMerchantPerformance(page = 1, limit = 20, startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const skip = (page - 1) * limit;

    const merchants = await this.prisma.merchant.findMany({
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const merchantPerformance = await Promise.all(
      merchants.map(async (merchant) => {
        const [totalOrders, completedOrders, revenue] = await Promise.all([
          this.prisma.order.count({ where: { merchantId: merchant.id, createdAt: { gte: start, lte: now } } }),
          this.prisma.order.count({
            where: { merchantId: merchant.id, status: 'DELIVERED', createdAt: { gte: start, lte: now } },
          }),
          this.prisma.order.aggregate({
            where: { merchantId: merchant.id, status: 'DELIVERED', createdAt: { gte: start, lte: now } },
            _sum: { total: true },
          }),
        ]);

        return {
          id: merchant.id,
          businessName: merchant.businessName,
          merchant: merchant.user,
          totalProducts: merchant._count.products,
          totalOrders,
          completedOrders,
          revenue: revenue._sum.total || 0,
          completionRate: totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0',
        };
      }),
    );

    const total = await this.prisma.merchant.count();

    return {
      items: merchantPerformance,
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

  async getOrderTrends(startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: start, lte: now } },
      select: { createdAt: true, status: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    const trends: Record<string, { orders: number; revenue: number; delivered: number; cancelled: number }> = {};

    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!trends[key]) trends[key] = { orders: 0, revenue: 0, delivered: 0, cancelled: 0 };
      trends[key].orders += 1;
      trends[key].revenue += order.total;
      if (order.status === 'DELIVERED') trends[key].delivered += 1;
      if (order.status === 'CANCELLED') trends[key].cancelled += 1;
    }

    return Object.entries(trends).map(([date, data]) => ({ date, ...data }));
  }

  async getPaymentMethodDistribution(startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const payments = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        status: 'PAID',
        createdAt: { gte: start, lte: now },
      },
      _count: { method: true },
      _sum: { amount: true },
    });

    return payments.map((p) => ({
      method: p.method,
      count: p._count.method,
      total: p._sum.amount || 0,
    }));
  }

  async getCategoryPerformance(startDate?: Date, endDate?: Date) {
    const now = endDate || new Date();
    const start = startDate || new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const categories = await this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
        products: {
          where: {
            orderItems: {
              some: {
                order: {
                  status: 'DELIVERED',
                  createdAt: { gte: start, lte: now },
                },
              },
            },
          },
          select: {
            orderItems: {
              where: {
                order: {
                  status: 'DELIVERED',
                  createdAt: { gte: start, lte: now },
                },
              },
              select: { totalPrice: true, quantity: true },
            },
          },
        },
      },
    });

    return categories.map((cat) => {
      const totalRevenue = cat.products.reduce(
        (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.totalPrice, 0),
        0,
      );
      const totalSold = cat.products.reduce(
        (sum, p) => sum + p.orderItems.reduce((s, oi) => s + oi.quantity, 0),
        0,
      );

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products,
        totalSold,
        totalRevenue,
      };
    });
  }
}
