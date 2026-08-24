import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackProvider } from './providers/paystack.provider';
import { FlutterwaveProvider } from './providers/flutterwave.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaystackProvider, FlutterwaveProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
