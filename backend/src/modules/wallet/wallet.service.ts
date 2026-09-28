import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { PaystackProvider } from '../payments/providers/paystack.provider';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly paystackProvider: PaystackProvider,
  ) {}

  async getWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId },
        include: { transactions: { take: 0 } },
      });
    }

    return wallet;
  }

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      select: { balance: true, locked: true },
    });

    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async fundWallet(userId: string, amount: number, reference?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const ref = reference || `WAL-FUND-${uuidv4().slice(0, 8).toUpperCase()}`;

    const [updated] = await Promise.all([
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { increment: amount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'funding',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance + amount,
          reference: ref,
          description: 'Wallet funding',
          status: 'completed',
        },
      }),
    ]);

    return { balance: updated.balance, reference: ref };
  }

  async fundWalletViaPaystack(userId: string, amount: number, reference?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    const paystackKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (paystackKey) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      const ref = reference || `WAL-FUND-${uuidv4().slice(0, 8).toUpperCase()}`;
      try {
        const init = await this.paystackProvider.initializePayment(user.email, amount, ref, {
          userId,
          walletFunding: true,
        });
        return { type: 'paystack', authorizationUrl: init.authorizationUrl, reference: ref };
      } catch (e: any) {
        this.logger.warn(`Paystack init failed, falling back to direct fund: ${e.message}`);
      }
    }
    return this.fundWallet(userId, amount, reference);
  }

  async payFromWallet(userId: string, amount: number, description?: string) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < amount) throw new BadRequestException('Insufficient balance');

    const ref = `WAL-PAY-${uuidv4().slice(0, 8).toUpperCase()}`;

    const [updated] = await Promise.all([
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'payment',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - amount,
          reference: ref,
          description: description || 'Wallet payment',
          status: 'completed',
        },
      }),
    ]);

    return { balance: updated.balance, reference: ref };
  }

  async withdraw(userId: string, amount: number, bankDetails?: { bank: string; accountNumber: string; accountName: string }) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < amount) throw new BadRequestException('Insufficient balance');

    const ref = `WAL-WITH-${uuidv4().slice(0, 8).toUpperCase()}`;

    const [updated] = await Promise.all([
      this.prisma.wallet.update({
        where: { userId },
        data: { balance: { decrement: amount } },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'withdrawal',
          amount,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance - amount,
          reference: ref,
          description: bankDetails
            ? `Withdrawal to ${bankDetails.bank} - ${bankDetails.accountNumber}`
            : 'Wallet withdrawal',
          status: 'completed',
        },
      }),
    ]);

    return { balance: updated.balance, reference: ref };
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      items,
      balance: wallet.balance,
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

  async lockFunds(userId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.balance < amount) throw new BadRequestException('Insufficient balance');

    return this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
        locked: { increment: amount },
      },
    });
  }

  async unlockFunds(userId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.locked < amount) throw new BadRequestException('Insufficient locked funds');

    return this.prisma.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount },
        locked: { decrement: amount },
      },
    });
  }
}
