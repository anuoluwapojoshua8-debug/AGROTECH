import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
  };
}

@Injectable()
export class PaystackProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY', '');
  }

  async initializePayment(email: string, amount: number, reference: string, metadata?: any) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          reference,
          metadata,
          callback_url: this.configService.get<string>('PAYSTACK_CALLBACK_URL', 'http://localhost:4000/api/v1/payments/verify'),
        }),
      });

      const data: PaystackInitResponse = await response.json();

      if (!data.status) {
        throw new HttpException(data.message || 'Payment initialization failed', HttpStatus.BAD_REQUEST);
      }

      return {
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
        accessCode: data.data.access_code,
      };
    } catch (error: any) {
      this.logger.error(`Paystack init error: ${error.message}`);
      throw new HttpException(
        error.message || 'Payment initialization failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      const data: PaystackVerifyResponse = await response.json();

      if (!data.status) {
        throw new HttpException('Payment verification failed', HttpStatus.BAD_REQUEST);
      }

      return {
        status: data.data.status === 'success' ? 'PAID' : 'FAILED',
        reference: data.data.reference,
        amount: data.data.amount / 100,
        currency: data.data.currency,
        paidAt: data.data.paid_at,
        channel: data.data.channel,
      };
    } catch (error: any) {
      this.logger.error(`Paystack verify error: ${error.message}`);
      throw new HttpException(
        error.message || 'Payment verification failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refundPayment(reference: string, amount?: number) {
    try {
      const body: any = { transaction: reference };
      if (amount) body.amount = Math.round(amount * 100);

      const response = await fetch(`${this.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!data.status) {
        throw new HttpException(data.message || 'Refund failed', HttpStatus.BAD_REQUEST);
      }

      return {
        status: 'REFUNDED',
        reference: data.data?.transaction?.reference || reference,
        refundReference: data.data?.reference,
      };
    } catch (error: any) {
      this.logger.error(`Paystack refund error: ${error.message}`);
      throw new HttpException(
        error.message || 'Refund failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
