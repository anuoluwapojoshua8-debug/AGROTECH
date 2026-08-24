import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
        merchant: {
          select: { id: true, businessName: true, status: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (existing && existing.id !== userId) throw new ConflictException('Email already in use');
    }

    if (dto.phone) {
      const existing = await this.prisma.user.findUnique({ where: { phone: dto.phone } });
      if (existing && existing.id !== userId) throw new ConflictException('Phone already in use');
    }

    const data: any = {};
    if (dto.firstName) data.firstName = dto.firstName;
    if (dto.lastName) data.lastName = dto.lastName;
    if (dto.email) data.email = dto.email.toLowerCase();
    if (dto.phone) data.phone = dto.phone;
    if (dto.avatar) data.avatar = dto.avatar;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async addAddress(userId: string, data: {
    label?: string;
    street: string;
    city: string;
    state: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  }) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.create({
      data: {
        userId,
        label: data.label || 'Home',
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        lat: data.lat,
        lng: data.lng,
        isDefault: data.isDefault || false,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  }) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.prisma.address.delete({ where: { id: addressId } });
    return { message: 'Address deleted successfully' };
  }
}
