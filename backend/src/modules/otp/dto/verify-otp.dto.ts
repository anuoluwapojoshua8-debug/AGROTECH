import { IsOptional, IsString, IsIn, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @Length(4, 8)
  code: string;

  @IsOptional()
  @IsIn(['email', 'sms'])
  channel?: 'email' | 'sms';
}
