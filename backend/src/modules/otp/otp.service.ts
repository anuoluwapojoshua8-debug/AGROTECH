import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { SmsService } from '../sms/sms.service';

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly store = new Map<string, OtpEntry>();
  private readonly TTL_MS = 5 * 60 * 1000;
  private readonly MAX_ATTEMPTS = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  private key(channel: string, identifier: string) {
    return `${channel}:${identifier.toLowerCase()}`;
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(email?: string, phone?: string, channel: 'email' | 'sms' | 'both' = 'email') {
    let targets: { channel: 'email' | 'sms'; identifier: string; user?: any }[] = [];

    if ((channel === 'email' || channel === 'both') && email) {
      const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) throw new NotFoundException('Email not found. Please register first.');
      targets.push({ channel: 'email', identifier: email.toLowerCase(), user });
    }
    if ((channel === 'sms' || channel === 'both') && phone) {
      const user = await this.prisma.user.findUnique({ where: { phone } });
      if (!user) throw new NotFoundException('Phone not found. Please register first.');
      targets.push({ channel: 'sms', identifier: phone, user });
    }

    if (targets.length === 0) throw new BadRequestException('Provide email and/or phone with matching channel');

    const results: any[] = [];
    for (const t of targets) {
      const code = this.generateCode();
      const k = this.key(t.channel, t.identifier);
      this.store.set(k, { code, expiresAt: Date.now() + this.TTL_MS, attempts: 0 });
      this.logger.log(`OTP ${code} for ${k} expires in 5min`);

      if (t.channel === 'email') {
        const res = await this.mailService.sendOtpEmail(t.identifier, code, t.user?.firstName);
        results.push({ channel: 'email', to: t.identifier, simulated: (res as any)?.simulated || false, code: (res as any)?.simulated ? code : undefined });
      } else {
        const res = await this.smsService.sendOtpSms(t.identifier, code);
        results.push({ channel: 'sms', to: t.identifier, simulated: (res as any)?.simulated || false, code: (res as any)?.simulated ? code : undefined });
      }
    }

    // In simulation mode return code for testing — in prod remove code field
    const isDev = process.env.NODE_ENV !== 'production';
    return {
      message: `OTP sent via ${channel}. Expires in 5 minutes.`,
      expiresIn: 300,
      preview: isDev ? results : undefined,
    };
  }

  async verifyOtp(email?: string, phone?: string, code?: string, channel?: 'email' | 'sms') {
    if (!code) throw new BadRequestException('Code is required');
    const identifier = channel === 'sms' ? phone : email;
    const ch = channel || (email ? 'email' : 'sms');
    if (!identifier) throw new BadRequestException('Provide email or phone matching channel');

    const k = this.key(ch, identifier);
    const entry = this.store.get(k);
    if (!entry) throw new BadRequestException('No OTP found or expired. Please request a new code.');
    if (Date.now() > entry.expiresAt) {
      this.store.delete(k);
      throw new BadRequestException('OTP expired. Please request a new code.');
    }
    if (entry.attempts >= this.MAX_ATTEMPTS) {
      this.store.delete(k);
      throw new BadRequestException('Too many attempts. Please request a new code.');
    }
    entry.attempts += 1;
    if (entry.code !== code) {
      throw new BadRequestException(`Invalid code. ${this.MAX_ATTEMPTS - entry.attempts} attempts left.`);
    }

    this.store.delete(k);

    // Mark verified in DB
    if (ch === 'email' && email) {
      await this.prisma.user.update({ where: { email: email.toLowerCase() }, data: { isEmailVerified: true } });
    } else if (ch === 'sms' && phone) {
      await this.prisma.user.update({ where: { phone }, data: { isPhoneVerified: true } });
    }

    return { message: `${ch === 'email' ? 'Email' : 'Phone'} verified successfully`, verified: true };
  }

  async verifyBoth(email?: string, phone?: string, code?: string) {
    // Allow single code to verify both if both provided and channel both -> try email first then sms
    // Simplified: require caller to call verify per channel
    return this.verifyOtp(email, phone, code, email ? 'email' : 'sms');
  }
}
