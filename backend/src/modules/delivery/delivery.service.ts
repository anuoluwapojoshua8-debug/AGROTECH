import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRider(orderId: string, riderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const rider = await this.prisma.user.findUnique({ where: { id: riderId } });
    if (!rider || rider.role !== 'RIDER') throw new BadRequestException('User is not a rider');

    let delivery = await this.prisma.delivery.findUnique({ where: { orderId } });

    if (delivery) {
      delivery = await this.prisma.delivery.update({
        where: { orderId },
        data: {
          riderId,
          status: 'assigned',
        },
      });
    } else {
      delivery = await this.prisma.delivery.create({
        data: {
          orderId,
          riderId,
          status: 'assigned',
          pickupLat: order.deliveryLat,
          pickupLng: order.deliveryLng,
          dropoffLat: order.deliveryLat,
          dropoffLng: order.deliveryLng,
        },
      });
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'DISPATCHED' },
    });

    await this.prisma.notification.create({
      data: {
        userId: riderId,
        type: 'DELIVERY_ASSIGNED',
        title: 'New Delivery Assignment',
        body: `Order ${order.orderNumber} has been assigned to you`,
        data: { orderId, orderNumber: order.orderNumber },
      },
    });

    return delivery;
  }

  async startDelivery(orderId: string, riderId: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.riderId !== riderId) throw new ForbiddenException('This delivery is not assigned to you');

    const updated = await this.prisma.delivery.update({
      where: { orderId },
      data: {
        status: 'in_transit',
        startedAt: new Date(),
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_TRANSIT' },
    });

    return updated;
  }

  async updateLocation(orderId: string, riderId: string, lat: number, lng: number) {
    const delivery = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.riderId !== riderId) throw new ForbiddenException('This delivery is not assigned to you');

    return this.prisma.delivery.update({
      where: { orderId },
      data: { currentLat: lat, currentLng: lng },
    });
  }

  async markAsDelivered(orderId: string, riderId: string, proofImage?: string) {
    const delivery = await this.prisma.delivery.findUnique({ where: { orderId } });
    if (!delivery) throw new NotFoundException('Delivery not found');
    if (delivery.riderId !== riderId) throw new ForbiddenException('This delivery is not assigned to you');

    const now = new Date();

    const updated = await this.prisma.delivery.update({
      where: { orderId },
      data: {
        status: 'delivered',
        completedAt: now,
        proofImage,
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        deliveredAt: now,
      },
    });

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });

    if (order) {
      await this.prisma.notification.create({
        data: {
          userId: order.buyerId,
          type: 'ORDER_DELIVERED',
          title: 'Order Delivered',
          body: `Order ${order.orderNumber} has been delivered`,
          data: { orderId, orderNumber: order.orderNumber },
        },
      });

      const merchant = await this.prisma.merchant.findUnique({ where: { id: order.merchantId } });
      if (merchant) {
        await this.prisma.notification.create({
          data: {
            userId: merchant.userId,
            type: 'ORDER_DELIVERED',
            title: 'Order Delivered',
            body: `Order ${order.orderNumber} has been delivered`,
            data: { orderId, orderNumber: order.orderNumber },
          },
        });
      }

      await this.prisma.earnings.create({
        data: {
          merchantId: order.merchantId,
          amount: order.total * 0.95,
          reference: `EARN-${order.orderNumber}`,
          status: 'pending',
        },
      });
    }

    return updated;
  }

  async getDeliveryByOrderId(orderId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { orderId },
      include: {
        order: {
          select: {
            orderNumber: true,
            status: true,
            deliveryAddress: true,
            buyer: { select: { firstName: true, lastName: true, phone: true } },
          },
        },
      },
    });

    if (!delivery) throw new NotFoundException('Delivery not found');
    return delivery;
  }

  async getRiderDeliveries(riderId: string, status?: string, page = 1, limit = 20) {
    const where: any = { riderId };
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              deliveryAddress: true,
              deliveryLat: true,
              deliveryLng: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.delivery.count({ where }),
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

  async getPendingDeliveries(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.delivery.findMany({
        where: { status: 'pending' },
        include: {
          order: {
            select: {
              orderNumber: true,
              deliveryAddress: true,
              deliveryLat: true,
              deliveryLng: true,
              total: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.delivery.count({ where: { status: 'pending' } }),
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
}
