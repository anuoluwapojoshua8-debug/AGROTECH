import { IsString, IsOptional, IsArray, IsUUID, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  deliveryAddress: string;

  @IsOptional()
  deliveryLat?: number;

  @IsOptional()
  deliveryLng?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
