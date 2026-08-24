import { Controller, Get, Post, Delete, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@CurrentUser('id') userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post(':productId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addItem(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.addItem(userId, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeItem(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.removeItem(userId, productId);
  }

  @Get('check/:productId')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  async checkItem(@CurrentUser('id') userId: string, @Param('productId') productId: string) {
    return this.wishlistService.isInWishlist(userId, productId);
  }
}
