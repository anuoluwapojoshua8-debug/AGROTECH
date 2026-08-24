import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaystackProvider } from './providers/paystack.provider';
import { FlutterwaveProvider } from './providers/flutterwave.provider';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystackProvider: PaystackProvider,
    private readonly flutterwaveProvider: FlutterwaveProvider,
  ) {}

  async initiatePayment(userId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new BadRequestException('This order does not belong to you');
    if (order.paymentStatus === 'PAID') throw new BadRequestException('Order already paid');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const method = dto.method || 'PAYSTACK';

    if (method === 'WALLET') {
      return this.processWalletPayment(userId, order);
    }

    const transactionRef = `AGT-${uuidv4().slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const provider = method === 'FLUTTERWAVE' ? 'FLUTTERWAVE' : 'PAYSTACK';

    let result: any;
    if (provider === 'PAYSTACK') {
      result = await this.paystackProvider.initializePayment(user.email, order.total, transactionRef, {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    } else {
      result = await this.flutterwaveProvider.initializePayment(user.email, order.total, transactionRef, {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'NGN',
        status: 'PENDING',
        method: method as any,
        provider,
        providerRef: result.reference || result.authorizationUrl,
        transactionRef,
      },
    });

    return {
      authorizationUrl: result.authorizationUrl,
      reference: transactionRef,
      provider,
    };
  }

  async verifyPayment(reference: string, provider?: string) {
    const payment = await this.prisma.payment.findUnique({ where: { transactionRef: reference } });
    if (!payment) throw new NotFoundException('Payment not found');

    let result: any;
    if (provider === 'FLUTTERWAVE' || payment.provider === 'FLUTTERWAVE') {
      result = await this.flutterwaveProvider.verifyPayment(reference);
    } else {
      result = await this.paystackProvider.verifyPayment(reference);
    }

    if (result.status === 'PAID') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID' },
      });

      await this.prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'PAID',
          paymentMethod: payment.method,
          status: 'CONFIRMED',
        },
      });

      await this.prisma.walletTransaction.create({
        data: {
          walletId: (await this.getBuyerWallet(payment.orderId)).id,
          type: 'debit',
          amount: payment.amount,
          balanceBefore: 0,
          balanceAfter: 0,
          reference: `PAY-${reference}`,
          description: `Payment for order`,
          status: 'completed',
        },
      });
    } else {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
    }

    return result;
  }

  async refundPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'PAID') throw new BadRequestException('Payment is not in paid status');

    let result: any;
    if (payment.provider === 'FLUTTERWAVE') {
      result = await this.flutterwaveProvider.refundPayment(payment.providerRef || payment.transactionRef);
    } else {
      result = await this.paystackProvider.refundPayment(payment.transactionRef);
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'REFUNDED' },
    });

    return result;
  }

  async getPaymentByOrderId(orderId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { orderId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  private async processWalletPayment(userId: string, order: any) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < order.total) throw new BadRequestException('Insufficient wallet balance');

    const transactionRef = `WAL-${uuidv4().slice(0, 8).toUpperCase()}`;

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: { decrement: order.total } },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'payment',
        amount: order.total,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - order.total,
        reference: transactionRef,
        description: `Payment for order ${order.orderNumber}`,
        status: 'completed',
      },
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.total,
        currency: 'NGN',
        status: 'PAID',
        method: 'WALLET',
        provider: 'WALLET',
        transactionRef,
      },
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', paymentMethod: 'WALLET', status: 'CONFIRMED' },
    });

    return { message: 'Payment successful', reference: transactionRef };
  }

  private async getBuyerWallet(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const wallet = await this.prisma.wallet.findUnique({ where: { userId: order.buyerId } });
    if (!wallet) throw new NotFoundException('Buyer wallet not found');
    return wallet;
  }

  async getPaymentHistory(userId: string, page = 1, limit = 20) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId: userId },
      select: { id: true },
    });

    const orderIds = orders.map((o) => o.id);

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { orderId: { in: orderIds } },
        include: { order: { select: { orderNumber: true, total: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { orderId: { in: orderIds } } }),
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
