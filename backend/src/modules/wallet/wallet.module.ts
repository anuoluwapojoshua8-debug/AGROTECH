import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PaystackProvider } from '../payments/providers/paystack.provider';

@Module({
  controllers: [WalletController],
  providers: [WalletService, PaystackProvider],
  exports: [WalletService],
})
export class WalletModule {}
