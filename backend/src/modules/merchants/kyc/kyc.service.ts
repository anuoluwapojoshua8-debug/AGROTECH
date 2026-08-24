import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async submitKyc(
    userId: string,
    data: {
      idDocument: string;
      idDocumentType: string;
      bvn?: string;
      taxId?: string;
    },
  ) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (merchant.kycApproved) throw new BadRequestException('KYC already approved');

    const updated = await this.prisma.merchant.update({
      where: { userId },
      data: {
        idDocument: data.idDocument,
        idDocumentType: data.idDocumentType,
        bvn: data.bvn,
        taxId: data.taxId,
        kycSubmitted: true,
      },
    });

    return updated;
  }

  async getKycStatus(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      select: {
        kycSubmitted: true,
        kycApproved: true,
        idDocumentType: true,
        status: true,
        idDocument: true,
        bvn: true,
        taxId: true,
      },
    });

    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async approveKyc(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    if (!merchant.kycSubmitted) throw new BadRequestException('KYC has not been submitted yet');

    const updated = await this.prisma.merchant.update({
      where: { userId },
      data: {
        kycApproved: true,
        status: 'VERIFIED',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true, isPhoneVerified: true },
    });

    return updated;
  }

  async rejectKyc(userId: string, reason?: string) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    return this.prisma.merchant.update({
      where: { userId },
      data: {
        kycSubmitted: false,
        kycApproved: false,
        status: 'REJECTED',
      },
    });
  }

  async getPendingKycSubmissions(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where: { kycSubmitted: true, kycApproved: false },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.merchant.count({
        where: { kycSubmitted: true, kycApproved: false },
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
    };
  }
}
