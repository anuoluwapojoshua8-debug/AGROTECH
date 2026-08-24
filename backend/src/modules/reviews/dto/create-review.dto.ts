import { IsString, IsInt, IsOptional, IsArray, Min, Max, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsUUID()
  productId: string;

  @IsString()
  @IsUUID()
  orderId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
