import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OtpService } from './otp.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('otp')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Public()
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP via email/SMS (or both)' })
  async send(@Body() dto: SendOtpDto) {
    return this.otpService.sendOtp(dto.email, dto.phone, dto.channel);
  }

  @Public()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for email or SMS' })
  async verify(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyOtp(dto.email, dto.phone, dto.code, dto.channel);
  }
}
