import { IsString, IsOptional, IsEnum } from 'class-validator';

export class InitiatePaymentDto {
  @IsString()
  orderId: string;

  @IsOptional()
  @IsString()
  @IsEnum(['PAYSTACK', 'FLUTTERWAVE', 'WALLET', 'CARD', 'BANK_TRANSFER', 'USSD'])
  method?: string;
}
