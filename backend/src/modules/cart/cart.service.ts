import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            unit: true,
            quantity: true,
            status: true,
            merchant: {
              select: { id: true, businessName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, subtotal, itemCount };
  }

  async addItem(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'ACTIVE') throw new BadRequestException('Product is not available');
    if (product.quantity < dto.quantity) throw new BadRequestException('Insufficient stock');

    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: dto.productId } },
    });

    if (existing) {
      const newQty = existing.quantity + dto.quantity;
      if (product.quantity < newQty) throw new BadRequestException('Insufficient stock');

      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
        include: { product: { select: { id: true, name: true, price: true, images: true, unit: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      },
      include: { product: { select: { id: true, name: true, price: true, images: true, unit: true } } },
    });
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
      include: { product: true },
    });

    if (!item) throw new NotFoundException('Cart item not found');
    if (item.product.quantity < quantity) throw new BadRequestException('Insufficient stock');

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: { select: { id: true, name: true, price: true, images: true, unit: true } } },
    });
  }

  async removeItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return { message: 'Cart cleared' };
  }
}
