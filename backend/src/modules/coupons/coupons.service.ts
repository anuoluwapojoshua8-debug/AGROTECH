import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) throw new ConflictException('Coupon code already exists');

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxDiscount: dto.maxDiscount,
        usageLimit: dto.usageLimit,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.coupon.count(),
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

  async findById(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async validate(code: string, orderAmount: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      throw new BadRequestException('Coupon is not yet active');
    }
    if (coupon.expiresAt && coupon.expiresAt < now) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minOrderAmount} required`);
    }

    let discount: number;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    return {
      valid: true,
      coupon,
      discount: Math.round(discount * 100) / 100,
    };
  }

  async update(id: string, dto: Partial<CreateCouponDto>) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    const data: any = {};
    if (dto.code) data.code = dto.code.toUpperCase();
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.discountType) data.discountType = dto.discountType;
    if (dto.discountValue !== undefined) data.discountValue = dto.discountValue;
    if (dto.minOrderAmount !== undefined) data.minOrderAmount = dto.minOrderAmount;
    if (dto.maxDiscount !== undefined) data.maxDiscount = dto.maxDiscount;
    if (dto.usageLimit !== undefined) data.usageLimit = dto.usageLimit;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.startsAt) data.startsAt = new Date(dto.startsAt);
    if (dto.expiresAt) data.expiresAt = new Date(dto.expiresAt);

    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(id: string) {
    const coupon = await this.prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');

    await this.prisma.coupon.delete({ where: { id } });
    return { message: 'Coupon deleted' };
  }
}
