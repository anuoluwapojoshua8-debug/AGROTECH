import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReferralsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateReferralCode(userId: string): Promise<string> {
    const base = `AGT-${uuidv4().slice(0, 6).toUpperCase()}`;

    const existing = await this.prisma.referral.findFirst({
      where: { referrerId: userId },
    });

    if (existing) return existing.code;

    await this.prisma.referral.create({
      data: {
        referrerId: userId,
        refereeId: userId,
        code: base,
      },
    });

    return base;
  }

  async getReferralCode(userId: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { referrerId: userId },
    });

    return { code: referral?.code || null };
  }

  async applyReferral(newUserId: string, code: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { code: code.toUpperCase() },
    });

    if (!referral) throw new BadRequestException('Invalid referral code');
    if (referral.referrerId === newUserId) throw new BadRequestException('Cannot refer yourself');

    const existingReferee = await this.prisma.referral.findUnique({
      where: { refereeId: newUserId },
    });

    if (existingReferee) throw new ConflictException('User already referred');

    const rewardAmount = 500;

    await this.prisma.referral.create({
      data: {
        referrerId: referral.referrerId,
        refereeId: newUserId,
        code: code.toUpperCase(),
        rewardAmount,
        status: 'completed',
      },
    });

    await this.fundWallet(referral.referrerId, rewardAmount, `Referral bonus for referring new user`);
    await this.fundWallet(newUserId, 200, 'Welcome referral bonus');

    return { message: 'Referral applied successfully', bonus: rewardAmount };
  }

  async getReferrals(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.referral.count({ where: { referrerId: userId } }),
    ]);

    const totalRewards = await this.prisma.referral.aggregate({
      where: { referrerId: userId },
      _sum: { rewardAmount: true },
    });

    const refereeIds = items.filter((r) => r.refereeId !== r.referrerId).map((r) => r.refereeId);

    const referees = refereeIds.length > 0
      ? await this.prisma.user.findMany({
          where: { id: { in: refereeIds } },
          select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
        })
      : [];

    return {
      items: items
        .filter((r) => r.refereeId !== r.referrerId)
        .map((r) => ({
          id: r.id,
          code: r.code,
          rewardAmount: r.rewardAmount,
          status: r.status,
          createdAt: r.createdAt,
          referee: referees.find((ref) => ref.id === r.refereeId) || null,
        })),
      totalRewards: totalRewards._sum.rewardAmount || 0,
      meta: {
        total: total - 1,
        page,
        limit,
        totalPages: Math.ceil((total - 1) / limit),
        hasNext: page * limit < total - 1,
        hasPrev: page > 1,
      },
    };
  }

  async getReferralStats(userId: string) {
    const [totalReferrals, completedReferrals, totalRewards] = await Promise.all([
      this.prisma.referral.count({
        where: { referrerId: userId, refereeId: { not: userId } },
      }),
      this.prisma.referral.count({
        where: { referrerId: userId, status: 'completed', refereeId: { not: userId } },
      }),
      this.prisma.referral.aggregate({
        where: { referrerId: userId },
        _sum: { rewardAmount: true },
      }),
    ]);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals: totalReferrals - completedReferrals,
      totalEarned: totalRewards._sum.rewardAmount || 0,
      rewardPerReferral: 500,
    };
  }

  private async fundWallet(userId: string, amount: number, description: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return;

    await this.prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'referral_bonus',
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        reference: `REF-${uuidv4().slice(0, 8).toUpperCase()}`,
        description,
        status: 'completed',
      },
    });
  }
}
