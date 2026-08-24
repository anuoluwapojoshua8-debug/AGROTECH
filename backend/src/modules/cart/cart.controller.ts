import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  async getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  async addItem(@CurrentUser('id') userId: string, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  async updateItem(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateCartDto) {
    return this.cartService.updateItem(userId, id, dto.quantity);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from cart' })
  async removeItem(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.cartService.removeItem(userId, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
