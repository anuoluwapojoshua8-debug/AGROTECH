import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product (Seller)' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all products with search, filter, sort, pagination' })
  async findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  async getFeatured(@Query('limit') limit?: number) {
    return this.productsService.findFeatured(limit);
  }

  @Public()
  @Get('best-sellers')
  @ApiOperation({ summary: 'Get best selling products' })
  async getBestSellers(@Query('limit') limit?: number) {
    return this.productsService.findBestSellers(limit);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search products' })
  async search(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get product by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product (Seller)' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Seller)' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.productsService.delete(userId, id);
  }

  @Get('merchant/my-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my products (Seller)' })
  async getMyProducts(@CurrentUser('id') userId: string, @Query() query: QueryProductDto) {
    return this.productsService.getMerchantProducts(userId, query);
  }

  @Public()
  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  async getRelated(@Param('id') id: string) {
    return this.productsService.getRelatedProducts(id);
  }
}
