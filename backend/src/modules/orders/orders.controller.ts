import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create order from cart' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.createFromCart(userId, dto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my orders (Buyer)' })
  async getMyOrders(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.ordersService.getBuyerOrders(userId, page, limit);
  }

  @Get('merchant-orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant orders (Seller)' })
  async getMerchantOrders(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.ordersService.getMerchantOrders(userId, status, page, limit);
  }

  @Get('merchant-stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant order stats (Seller)' })
  async getMerchantStats(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrderStats(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Public()
  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Track order by order number' })
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Seller/Admin)' })
  async updateStatus(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.updateStatus(userId, id, dto);
  }

  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel order (Buyer)' })
  async cancelOrder(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.ordersService.cancelOrder(userId, id);
  }
}
