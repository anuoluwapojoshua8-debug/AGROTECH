import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { KycService } from './kyc/kyc.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly kycService: KycService,
  ) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register as a merchant' })
  async register(@CurrentUser('id') userId: string, @Body() dto: RegisterMerchantDto) {
    return this.merchantsService.register(userId, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get merchant profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.merchantsService.getProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update merchant profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateMerchantDto) {
    return this.merchantsService.updateProfile(userId, dto);
  }

  @Post('kyc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit KYC documents' })
  async submitKyc(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.kycService.submitKyc(userId, body);
  }

  @Get('kyc/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get KYC submission status' })
  async getKycStatus(@CurrentUser('id') userId: string) {
    return this.kycService.getKycStatus(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get merchant public profile' })
  async getPublicProfile(@Param('id') id: string) {
    return this.merchantsService.getPublicProfile(id);
  }
}
