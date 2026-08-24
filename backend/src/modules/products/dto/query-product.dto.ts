import { IsOptional, IsString, IsEnum, IsNumber, Min, Max, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTag, ProductStatus } from '@agrotech/shared';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryProductDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(ProductTag, { each: true })
  tags?: ProductTag[];

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @Type(() => Boolean)
  isOrganic?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  isFresh?: boolean;
}
