import { Module } from '@nestjs/common';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { KycService } from './kyc/kyc.service';

@Module({
  controllers: [MerchantsController],
  providers: [MerchantsService, KycService],
  exports: [MerchantsService, KycService],
})
export class MerchantsModule {}
