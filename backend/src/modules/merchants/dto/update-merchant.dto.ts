import { PartialType } from '@nestjs/mapped-types';
import { RegisterMerchantDto } from './register-merchant.dto';

export class UpdateMerchantDto extends PartialType(RegisterMerchantDto) {}
