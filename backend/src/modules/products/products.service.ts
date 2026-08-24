import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(merchantId: string, dto: CreateProductDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId: merchantId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return this.prisma.product.create({
      data: {
        merchantId: merchant.id,
        categoryId: dto.categoryId,
        name: dto.name,
        slug,
        description: dto.description,
        price: dto.price,
        comparePrice: dto.comparePrice,
        quantity: dto.quantity ?? 0,
        unit: dto.unit ?? 'kg',
        images: dto.images ?? [],
        tags: dto.tags ?? [],
        deliveryTime: dto.deliveryTime,
        origin: dto.origin,
        isOrganic: dto.isOrganic ?? false,
        isFresh: dto.isFresh ?? true,
        isFrozen: dto.isFrozen ?? false,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        merchant: { select: { id: true, businessName: true } },
      },
    });
  }

  async findAll(query: QueryProductDto) {
    const where: Prisma.ProductWhereInput = {};
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};

    const search = query.search || query.q;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.merchantId) {
      const merchant = await this.prisma.merchant.findUnique({ where: { userId: query.merchantId } });
      if (merchant) where.merchantId = merchant.id;
    }
    if (query.tags && query.tags.length > 0) where.tags = { hasSome: query.tags };
    if (query.status) where.status = query.status;
    else where.status = 'ACTIVE';

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.price.lte = query.maxPrice;
    }

    if (query.origin) where.origin = query.origin;
    if (query.isOrganic !== undefined) where.isOrganic = query.isOrganic;
    if (query.isFresh !== undefined) where.isFresh = query.isFresh;

    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.ProductOrderByWithRelationInput] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          merchant: { select: { id: true, businessName: true, businessLogo: true } },
        },
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

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        merchant: {
          select: {
            id: true,
            businessName: true,
            businessLogo: true,
            description: true,
            userId: true,
          },
        },
        reviews: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        merchant: { select: { id: true, businessName: true, businessLogo: true } },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant || product.merchantId !== merchant.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    const data: any = {};
    if (dto.name) {
      data.name = dto.name;
      data.slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.price !== undefined) data.price = dto.price;
    if (dto.comparePrice !== undefined) data.comparePrice = dto.comparePrice;
    if (dto.quantity !== undefined) data.quantity = dto.quantity;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.tags !== undefined) data.tags = dto.tags;
    if (dto.deliveryTime !== undefined) data.deliveryTime = dto.deliveryTime;
    if (dto.origin !== undefined) data.origin = dto.origin;
    if (dto.isOrganic !== undefined) data.isOrganic = dto.isOrganic;
    if (dto.isFresh !== undefined) data.isFresh = dto.isFresh;
    if (dto.isFrozen !== undefined) data.isFrozen = dto.isFrozen;

    return this.prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async delete(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant || product.merchantId !== merchant.id) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.prisma.product.delete({ where: { id: productId } });
    return { message: 'Product deleted successfully' };
  }

  async getMerchantProducts(userId: string, query: QueryProductDto) {
    const merchant = await this.prisma.merchant.findUnique({ where: { userId } });
    if (!merchant) throw new ForbiddenException('User is not a merchant');

    return this.findAll({ ...query, merchantId: userId });
  }

  async getRelatedProducts(productId: string, limit?: number | string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const take = Number(limit) > 0 ? Math.floor(Number(limit)) : 6;

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        status: 'ACTIVE',
      },
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findFeatured(limit?: number | string) {
    const take = Number(limit) > 0 ? Math.floor(Number(limit)) : 12;
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE' },
      orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        merchant: { select: { id: true, businessName: true, businessLogo: true } },
      },
    });
  }

  async findBestSellers(limit?: number | string) {
    const take = Number(limit) > 0 ? Math.floor(Number(limit)) : 12;
    return this.prisma.product.findMany({
      where: { status: 'ACTIVE', tags: { has: 'BEST_SELLER' } },
      orderBy: { reviewCount: 'desc' },
      take,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        merchant: { select: { id: true, businessName: true, businessLogo: true } },
      },
    });
  }
}
