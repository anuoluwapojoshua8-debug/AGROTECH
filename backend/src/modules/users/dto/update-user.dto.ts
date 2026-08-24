import { IsString, MinLength, MaxLength, IsOptional, Matches, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{9,14}$/, { message: 'Phone must be a valid international phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
