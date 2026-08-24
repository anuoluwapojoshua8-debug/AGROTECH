import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FlutterwaveProvider {
  private readonly logger = new Logger(FlutterwaveProvider.name);
  private readonly baseUrl = 'https://api.flutterwave.com/v3';
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('FLUTTERWAVE_SECRET_KEY', '');
  }

  async initializePayment(email: string, amount: number, reference: string, metadata?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: reference,
          amount,
          currency: 'NGN',
          redirect_url: this.configService.get<string>(
            'FLUTTERWAVE_CALLBACK_URL',
            'http://localhost:4000/api/v1/payments/verify',
          ),
          customer: { email },
          meta: metadata,
        }),
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new HttpException(data.message || 'Payment initialization failed', HttpStatus.BAD_REQUEST);
      }

      return {
        authorizationUrl: data.data.link,
        reference,
      };
    } catch (error: any) {
      this.logger.error(`Flutterwave init error: ${error.message}`);
      throw new HttpException(
        error.message || 'Payment initialization failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${encodeURIComponent(transactionId)}/verify`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new HttpException('Payment verification failed', HttpStatus.BAD_REQUEST);
      }

      return {
        status: data.data.status === 'successful' ? 'PAID' : 'FAILED',
        reference: data.data.tx_ref,
        amount: data.data.amount,
        currency: data.data.currency,
        paidAt: data.data.paid_at,
        channel: data.data.payment_type,
      };
    } catch (error: any) {
      this.logger.error(`Flutterwave verify error: ${error.message}`);
      throw new HttpException(
        error.message || 'Payment verification failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refundPayment(transactionId: string, amount?: number) {
    try {
      const body: any = {};
      if (amount) body.amount = amount;

      const response = await fetch(`${this.baseUrl}/transactions/${encodeURIComponent(transactionId)}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.status !== 'success') {
        throw new HttpException(data.message || 'Refund failed', HttpStatus.BAD_REQUEST);
      }

      return {
        status: 'REFUNDED',
        reference: transactionId,
        refundReference: data.data?.id?.toString(),
      };
    } catch (error: any) {
      this.logger.error(`Flutterwave refund error: ${error.message}`);
      throw new HttpException(
        error.message || 'Refund failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
