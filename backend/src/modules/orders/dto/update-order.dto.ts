import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '@agrotech/shared';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
