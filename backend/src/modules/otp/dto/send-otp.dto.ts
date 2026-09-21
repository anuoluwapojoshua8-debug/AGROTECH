import { IsOptional, IsString, IsIn } from 'class-validator';

export class SendOtpDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsIn(['email', 'sms', 'both'])
  channel: 'email' | 'sms' | 'both';
}
