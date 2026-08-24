import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async register(userId: string, dto: RegisterMerchantDto) {
    const existing = await this.prisma.merchant.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('User already has a merchant account');

    return this.prisma.merchant.create({
      data: {
        userId,
        businessName: dto.businessName,
        businessAddress: dto.businessAddress,
        businessPhone: dto.businessPhone,
        businessLogo: dto.businessLogo,
        description: dto.description,
        deliveryRadius: dto.deliveryRadius || 10,
        produceTypes: dto.produceTypes || [],
        businessRegistrationNumber: dto.businessRegistrationNumber,
        idDocument: dto.idDocument,
        idDocumentType: dto.idDocumentType,
        businessDocuments: dto.businessDocuments || [],
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });
  }

  async getProfile(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        _count: { select: { products: true, orders: true } },
      },
    });

    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async getById(id: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        _count: { select: { products: true } },
      },
    });

    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async updateProfile(userId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) throw new NotFoundException('Merchant not found');

    return this.prisma.merchant.update({
      where: { userId },
      data: dto,
    });
  }

  async getMerchants(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.merchant.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
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

  async getPublicProfile(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        businessName: true,
        businessAddress: true,
        businessPhone: true,
        businessLogo: true,
        description: true,
        deliveryRadius: true,
        produceTypes: true,
        businessRegistrationNumber: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, avatar: true } },
        _count: { select: { products: { where: { status: 'ACTIVE' } } } },
      },
    });

    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }
}
