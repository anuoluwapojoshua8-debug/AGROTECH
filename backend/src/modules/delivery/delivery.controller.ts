import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AssignRiderDto } from './dto/assign-rider.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { MarkDeliveredDto } from './dto/mark-delivered.dto';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post(':orderId/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign rider to delivery (Admin)' })
  async assignRider(@Param('orderId') orderId: string, @Body() dto: AssignRiderDto) {
    return this.deliveryService.assignRider(orderId, dto.riderId);
  }

  @Put(':orderId/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start delivery (Rider)' })
  async startDelivery(@Param('orderId') orderId: string, @CurrentUser('id') userId: string) {
    return this.deliveryService.startDelivery(orderId, userId);
  }

  @Put(':orderId/location')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery location (Rider)' })
  async updateLocation(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.deliveryService.updateLocation(orderId, userId, dto.lat, dto.lng);
  }

  @Put(':orderId/deliver')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark delivery as completed (Rider)' })
  async markDelivered(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: MarkDeliveredDto,
  ) {
    return this.deliveryService.markAsDelivered(orderId, userId, dto.proofImage);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get delivery by order ID' })
  async getByOrder(@Param('orderId') orderId: string) {
    return this.deliveryService.getDeliveryByOrderId(orderId);
  }

  @Get('rider/my-deliveries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my deliveries (Rider)' })
  async getMyDeliveries(
    @CurrentUser('id') userId: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deliveryService.getRiderDeliveries(userId, status, page, limit);
  }

  @Get('pending/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RIDER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending deliveries' })
  async getPending(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.deliveryService.getPendingDeliveries(page, limit);
  }
}
