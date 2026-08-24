import { IsString, IsOptional, MinLength, MaxLength, IsNumber, Min, IsArray, ArrayMaxSize } from 'class-validator';

export class RegisterMerchantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  businessName: string;

  @IsString()
  @MinLength(5)
  @MaxLength(500)
  businessAddress: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  businessLogo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  deliveryRadius?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  produceTypes?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  idDocument?: string;

  @IsOptional()
  @IsString()
  idDocumentType?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  businessDocuments?: string[];
}
