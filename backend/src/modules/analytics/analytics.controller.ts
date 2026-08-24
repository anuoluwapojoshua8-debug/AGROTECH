import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Platform overview analytics' })
  async getOverview(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.analyticsService.getOverview(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue analytics' })
  async getRevenue(
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getRevenueAnalytics(period, limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'User growth analytics' })
  async getUserGrowth(
    @Query('period') period?: 'daily' | 'weekly' | 'monthly',
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getUserGrowth(period, limit);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top selling products' })
  async getTopProducts(
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getTopProducts(
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('merchants')
  @ApiOperation({ summary: 'Merchant performance analytics' })
  async getMerchantPerformance(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getMerchantPerformance(
      page,
      limit,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('orders')
  @ApiOperation({ summary: 'Order trends analytics' })
  async getOrderTrends(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.analyticsService.getOrderTrends(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'Payment method distribution' })
  async getPaymentMethods(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.analyticsService.getPaymentMethodDistribution(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Category performance analytics' })
  async getCategoryPerformance(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.analyticsService.getCategoryPerformance(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
