import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFromCart(userId: string, dto: CreateOrderDto) {
    const cart = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cart.length === 0) throw new BadRequestException('Cart is empty');

    const merchantIds = [...new Set(cart.map((item) => item.product.merchantId))];
    if (merchantIds.length > 1) {
      throw new BadRequestException('Cart contains products from multiple merchants. Please order from one merchant at a time.');
    }

    const merchantId = merchantIds[0];
    const merchant = await this.prisma.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    for (const item of cart) {
      if (item.product.status !== 'ACTIVE') {
        throw new BadRequestException(`Product "${item.product.name}" is not available`);
      }
      if (item.product.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for "${item.product.name}"`);
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const deliveryFee = subtotal >= 5000 ? 0 : 500;
    let discount = 0;

    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (coupon && coupon.isActive && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
            discount = coupon.discountType === 'PERCENTAGE'
              ? Math.min(subtotal * (coupon.discountValue / 100), coupon.maxDiscount || Infinity)
              : coupon.discountValue;

            await this.prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }
    }

    const total = subtotal + deliveryFee - discount;
    const orderNumber = `AGT-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        buyerId: userId,
        merchantId,
        subtotal,
        deliveryFee,
        discount,
        total,
        deliveryAddress: dto.deliveryAddress,
        deliveryLat: dto.deliveryLat,
        deliveryLng: dto.deliveryLng,
        note: dto.note,
        items: {
          create: cart.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.images[0] || null,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: item.product.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
        merchant: { select: { id: true, businessName: true } },
      },
    });

    for (const item of cart) {
      await this.prisma.product.update({
        where: { id: item.product.id },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    await this.prisma.cartItem.deleteMany({ where: { userId } });

    await this.prisma.notification.create({
      data: {
        userId: merchant.userId,
        type: 'NEW_ORDER',
        title: 'New Order Received',
        body: `Order ${orderNumber} has been placed`,
        data: { orderId: order.id, orderNumber },
      },
    });

    return order;
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        buyer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        merchant: { select: { id: true, businessName: true, businessPhone: true } },
        payment: true,
        delivery: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        buyer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        merchant: { select: { id: true, businessName: true, businessPhone: true } },
        payment: true,
        delivery: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getBuyerOrders(userId: string, page?: number | string, limit?: number | string) {
    const p = Number(page) > 0 ? Math.floor(Number(page)) : 1;
    const l = Number(limit) > 0 ? Math.floor(Number(limit)) : 20;
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          items: true,
          merchant: { select: { id: true, businessName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.order.count({ where: { buyerId: userId } }),
    ]);

    return {
      items,
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
        hasNext: p * l < total,
        hasPrev: p > 1,
      },
    };
  }

  async getMerchantOrders(merchantUserId: string, status?: string, page?: number | string, limit?: number | string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantUserId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const where: Prisma.OrderWhereInput = { merchantId: merchant.id };
    if (status) where.status = status as any;

    const p = Number(page) > 0 ? Math.floor(Number(page)) : 1;
    const l = Number(limit) > 0 ? Math.floor(Number(limit)) : 20;
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          buyer: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
        hasNext: p * l < total,
        hasPrev: p > 1,
      },
    };
  }

  async updateStatus(userId: string, orderId: string, dto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant || order.merchantId !== merchant.id) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException('You can only update your own orders');
      }
    }

    if (dto.status) {
      const validTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['DISPATCHED', 'CANCELLED'],
        DISPATCHED: ['IN_TRANSIT'],
        IN_TRANSIT: ['DELIVERED'],
        DELIVERED: ['RETURNED'],
        CANCELLED: [],
        RETURNED: [],
      };

      const allowed = validTransitions[order.status] || [];
      if (!allowed.includes(dto.status)) {
        throw new BadRequestException(`Cannot transition from ${order.status} to ${dto.status}`);
      }
    }

    const updateData: any = {};
    if (dto.status) updateData.status = dto.status;
    if (dto.note) updateData.note = dto.note;
    if (dto.status === 'DELIVERED') updateData.deliveredAt = new Date();

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true },
    });

    if (dto.status) {
      const title = `Order ${dto.status.toLowerCase().replace('_', ' ')}`;
      const body = `Order ${order.orderNumber} status updated to ${dto.status}`;

      await this.prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_UPDATE',
          title,
          body,
          data: { orderId, orderNumber: order.orderNumber, status: dto.status },
        },
      });
    }

    return updated;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new ForbiddenException('You can only cancel your own orders');
    if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    for (const item of order.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }

    const cancelled = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: { items: true },
    });

    const merchant = await this.prisma.merchant.findUnique({ where: { id: order.merchantId } });
    if (merchant) {
      await this.prisma.notification.create({
        data: {
          userId: merchant.userId,
          type: 'ORDER_CANCELLED',
          title: 'Order Cancelled',
          body: `Order ${order.orderNumber} has been cancelled`,
          data: { orderId, orderNumber: order.orderNumber },
        },
      });
    }

    return cancelled;
  }

  async trackOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        estimatedDelivery: true,
        createdAt: true,
        delivery: {
          select: {
            status: true,
            currentLat: true,
            currentLng: true,
            riderId: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getOrderStats(merchantUserId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantUserId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const [totalOrders, pendingOrders, processingOrders, deliveredOrders, cancelledOrders, totalRevenue] =
      await Promise.all([
        this.prisma.order.count({ where: { merchantId: merchant.id } }),
        this.prisma.order.count({ where: { merchantId: merchant.id, status: 'PENDING' } }),
        this.prisma.order.count({ where: { merchantId: merchant.id, status: 'PROCESSING' } }),
        this.prisma.order.count({ where: { merchantId: merchant.id, status: 'DELIVERED' } }),
        this.prisma.order.count({ where: { merchantId: merchant.id, status: 'CANCELLED' } }),
        this.prisma.order.aggregate({
          where: { merchantId: merchant.id, status: 'DELIVERED' },
          _sum: { total: true },
        }),
      ]);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }
}
