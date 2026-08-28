import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Initiate payment for order' })
  async initiate(@CurrentUser('id') userId: string, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(userId, dto);
  }

  @Public()
  @Get('verify')
  @ApiOperation({ summary: 'Verify payment callback' })
  async verify(@Query('reference') reference: string, @Query('provider') provider?: string) {
    return this.paymentsService.verifyPayment(reference, provider);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  async getHistory(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getPaymentHistory(userId, page, limit);
  }

  @Get(':orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by order ID' })
  async getByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrderId(orderId);
  }

  @Post(':orderId/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund payment (Admin)' })
  async refund(@Param('orderId') orderId: string) {
    return this.paymentsService.refundPayment(orderId);
  }

  @Public()
  @Post('webhook/paystack')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Paystack webhook — auto-verify payment' })
  async paystackWebhook(@Body() body: any, @Headers('x-paystack-signature') signature: string) {
    return this.paymentsService.handlePaystackWebhook(body, signature);
  }

  @Public()
  @Post('webhook/flutterwave')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Flutterwave webhook — auto-verify payment' })
  async flutterwaveWebhook(@Body() body: any, @Headers('verif-hash') verifHash: string) {
    return this.paymentsService.handleFlutterwaveWebhook(body, verifHash);
  }
}
