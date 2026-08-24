import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('referrals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('code')
  @ApiOperation({ summary: 'Get my referral code' })
  async getCode(@CurrentUser('id') userId: string) {
    return this.referralsService.getReferralCode(userId);
  }

  @Post('code/generate')
  @ApiOperation({ summary: 'Generate referral code' })
  async generateCode(@CurrentUser('id') userId: string) {
    const code = await this.referralsService.generateReferralCode(userId);
    return { code };
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply referral code' })
  async applyReferral(@CurrentUser('id') userId: string, @Body('code') code: string) {
    return this.referralsService.applyReferral(userId, code);
  }

  @Get()
  @ApiOperation({ summary: 'Get my referrals list' })
  async getReferrals(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.referralsService.getReferrals(userId, page, limit);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get referral statistics' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.referralsService.getReferralStats(userId);
  }
}
