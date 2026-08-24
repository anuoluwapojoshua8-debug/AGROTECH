import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, Matches, IsArray, ArrayMaxSize } from 'class-validator';
import { UserRole } from '@agrotech/shared';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/, { message: 'Phone must be a valid international phone number' })
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

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
