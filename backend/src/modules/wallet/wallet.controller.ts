import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { PayFromWalletDto } from './dto/pay-from-wallet.dto';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get wallet details with recent transactions' })
  async getWallet(@CurrentUser('id') userId: string) {
    return this.walletService.getWallet(userId);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Post('fund')
  @ApiOperation({ summary: 'Fund wallet' })
  async fundWallet(@CurrentUser('id') userId: string, @Body() dto: FundWalletDto) {
    return this.walletService.fundWallet(userId, dto.amount, dto.reference);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay from wallet' })
  async payFromWallet(@CurrentUser('id') userId: string, @Body() dto: PayFromWalletDto) {
    return this.walletService.payFromWallet(userId, dto.amount, dto.description);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Withdraw from wallet' })
  async withdraw(@CurrentUser('id') userId: string, @Body() dto: WithdrawDto) {
    return this.walletService.withdraw(userId, dto.amount, dto.bankDetails);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactionHistory(userId, page, limit);
  }
}
