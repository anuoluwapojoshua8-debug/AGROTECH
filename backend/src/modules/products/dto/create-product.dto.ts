import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, MaxLength, IsBoolean, MinLength } from 'class-validator';
import { ProductTag } from '@agrotech/shared';

export class CreateProductDto {
  @IsString()
  categoryId: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ProductTag, { each: true })
  tags?: ProductTag[];

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsBoolean()
  isOrganic?: boolean;

  @IsOptional()
  @IsBoolean()
  isFresh?: boolean;

  @IsOptional()
  @IsBoolean()
  isFrozen?: boolean;
}
