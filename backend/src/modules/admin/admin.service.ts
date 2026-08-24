import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, UserRole, ProductStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page = 1, limit = 20, role?: string, search?: string, isActive?: string) {
    const where: Prisma.UserWhereInput = {};

    if (role) where.role = role as UserRole;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          createdAt: true,
          updatedAt: true,
          merchant: { select: { id: true, businessName: true, status: true } },
          _count: { select: { orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
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

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        merchant: {
          include: {
            _count: { select: { products: true, orders: true } },
          },
        },
        addresses: true,
        wallet: true,
        _count: { select: { orders: true, reviews: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async suspendUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { merchant: { select: { id: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
      select: { id: true, firstName: true, lastName: true, isSuspended: true },
    });

    if (user.merchant) {
      await this.prisma.merchant.update({
        where: { id: user.merchant.id },
        data: { status: 'SUSPENDED' },
      });

      await this.prisma.notification.create({
        data: {
          userId,
          type: 'ACCOUNT_SUSPENDED',
          title: 'Account Suspended',
          body: 'Your account has been suspended by an administrator.',
        },
      });
    }

    return updated;
  }

  async getMerchants(page = 1, limit = 20, status?: string) {
    const where: Prisma.MerchantWhereInput = {};
    if (status) where.status = status as any;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          _count: { select: { products: true, orders: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.merchant.count({ where }),
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

  async approveMerchant(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const updated = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { status: 'VERIFIED', kycApproved: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: merchant.userId,
        type: 'MERCHANT_APPROVED',
        title: 'Merchant Account Approved',
        body: 'Your merchant account has been approved. You can now start selling.',
        data: { merchantId },
      },
    });

    return updated;
  }

  async rejectMerchant(merchantId: string, reason?: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    const updated = await this.prisma.merchant.update({
      where: { id: merchantId },
      data: { status: 'REJECTED' },
    });

    await this.prisma.notification.create({
      data: {
        userId: merchant.userId,
        type: 'MERCHANT_REJECTED',
        title: 'Merchant Account Rejected',
        body: reason || 'Your merchant account application has been rejected.',
        data: { merchantId, reason },
      },
    });

    return updated;
  }

  async getProducts(page = 1, limit = 20, status?: string) {
    const where: Prisma.ProductWhereInput = {};
    if (status) where.status = status as ProductStatus;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          merchant: { select: { id: true, businessName: true } },
          category: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
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

  async approveProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: 'ACTIVE' },
    });
  }

  async rejectProduct(productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: 'REJECTED' },
    });
  }

  async getTransactions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        include: {
          order: {
            select: { orderNumber: true, buyerId: true, total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count(),
    ]);

    const revenue = await this.prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      items,
      totalRevenue: revenue._sum.amount || 0,
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

  async getAnalytics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMerchants,
      totalProducts,
      totalOrders,
      totalRevenue,
      users30d,
      orders30d,
      revenue30d,
      pendingMerchants,
      pendingProducts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.merchant.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      this.prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.payment.aggregate({
        where: { status: 'PAID', createdAt: { gte: thirtyDaysAgo } },
        _sum: { amount: true },
      }),
      this.prisma.merchant.count({ where: { status: 'PENDING' } }),
      this.prisma.product.count({ where: { status: 'PENDING_REVIEW' } }),
    ]);

    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      users: { total: totalUsers, newLast30Days: users30d },
      merchants: { total: totalMerchants, pending: pendingMerchants },
      products: { total: totalProducts, pendingReview: pendingProducts },
      orders: {
        total: totalOrders,
        last30Days: orders30d,
        byStatus: ordersByStatus.map((o) => ({ status: o.status, count: o._count })),
      },
      revenue: {
        total: totalRevenue._sum.amount || 0,
        last30Days: revenue30d._sum.amount || 0,
      },
    };
  }

  async getBanners() {
    return this.prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createBanner(data: { title: string; subtitle?: string; image: string; link?: string; position?: string; sortOrder?: number }) {
    return this.prisma.banner.create({ data });
  }

  async updateBanner(id: string, data: any) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    return this.prisma.banner.update({ where: { id }, data });
  }

  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');

    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner deleted' };
  }

  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNext: page * limit < total, hasPrev: page > 1 },
    };
  }
}
