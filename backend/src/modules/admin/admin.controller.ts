import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateBannerDto } from './dto/create-banner.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.adminService.getUsers(page, limit, role, search, isActive);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  async suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Get('merchants')
  @ApiOperation({ summary: 'List all merchants' })
  async getMerchants(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getMerchants(page, limit, status);
  }

  @Put('merchants/:id/approve')
  @ApiOperation({ summary: 'Approve merchant' })
  async approveMerchant(@Param('id') id: string) {
    return this.adminService.approveMerchant(id);
  }

  @Put('merchants/:id/reject')
  @ApiOperation({ summary: 'Reject merchant' })
  async rejectMerchant(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.rejectMerchant(id, reason);
  }

  @Get('products')
  @ApiOperation({ summary: 'List all products' })
  async getProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.getProducts(page, limit, status);
  }

  @Put('products/:id/approve')
  @ApiOperation({ summary: 'Approve product' })
  async approveProduct(@Param('id') id: string) {
    return this.adminService.approveProduct(id);
  }

  @Put('products/:id/reject')
  @ApiOperation({ summary: 'Reject product' })
  async rejectProduct(@Param('id') id: string) {
    return this.adminService.rejectProduct(id);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'View all transactions' })
  async getTransactions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getTransactions(page, limit);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Platform analytics overview' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('banners')
  @ApiOperation({ summary: 'Get all banners' })
  async getBanners() {
    return this.adminService.getBanners();
  }

  @Post('banners')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create banner' })
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.adminService.createBanner(dto);
  }

  @Put('banners/:id')
  @ApiOperation({ summary: 'Update banner' })
  async updateBanner(@Param('id') id: string, @Body() dto: CreateBannerDto) {
    return this.adminService.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  @ApiOperation({ summary: 'Delete banner' })
  async deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View audit logs' })
  async getAuditLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getAuditLogs(page, limit);
  }
}
