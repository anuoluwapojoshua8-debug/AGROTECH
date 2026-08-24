import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SellerDashboardService } from './seller-dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('seller-dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SELLER')
@Controller('seller/dashboard')
export class SellerDashboardController {
  constructor(private readonly dashboardService: SellerDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get seller dashboard overview' })
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.dashboardService.getDashboard(userId);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Get sales analytics' })
  async getSalesAnalytics(
    @CurrentUser('id') userId: string,
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
  ) {
    return this.dashboardService.getSalesAnalytics(userId, period);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  async getTopProducts(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return this.dashboardService.getTopProducts(userId, limit);
  }

  @Get('earnings')
  @ApiOperation({ summary: 'Get earnings history' })
  async getEarnings(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.dashboardService.getEarningsHistory(userId, page, limit);
  }
}
