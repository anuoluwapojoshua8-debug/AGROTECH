import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new ConflictException('Category with this name already exists');

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        image: dto.image,
        parentId: dto.parentId,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, image: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: {
          where: { isActive: true },
          select: { id: true, name: true, slug: true, image: true },
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    const data: any = {};
    if (dto.name) {
      data.name = dto.name;
      data.slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.image !== undefined) data.image = dto.image;
    if (dto.parentId !== undefined) data.parentId = dto.parentId;

    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'Category deactivated successfully' };
  }

  async getTree() {
    const categories = await this.prisma.category.findMany({
      where: { parentId: null, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: { where: { isActive: true } },
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }
}
