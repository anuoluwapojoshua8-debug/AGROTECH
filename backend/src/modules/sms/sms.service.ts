import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromPhone: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID', '');
    this.authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN', '');
    this.fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER', '');
  }

  private get isConfigured(): boolean {
    return !!(
      this.accountSid &&
      this.authToken &&
      this.fromPhone &&
      !this.accountSid.includes('your-twilio') &&
      this.fromPhone !== '+1234567890'
    );
  }

  async sendSms(to: string, body: string) {
    if (!this.isConfigured) {
      this.logger.log(`[SMS SIMULATION] To: ${to} | Body: ${body}`);
      return { simulated: true, to, body };
    }
    try {
      // Use fetch to Twilio API to avoid requiring twilio SDK if not installed
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const form = new URLSearchParams();
      form.append('From', this.fromPhone);
      form.append('To', to);
      form.append('Body', body);
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        this.logger.warn(`Twilio error: ${JSON.stringify(data)} — falling back to simulation`);
        this.logger.log(`[SMS SIMULATION FALLBACK] To: ${to} | Body: ${body}`);
        return { simulated: true, to, body, error: data };
      }
      this.logger.log(`SMS sent to ${to}: ${data.sid}`);
      return { sid: data.sid, to, body };
    } catch (e: any) {
      this.logger.error(`SMS send failed: ${e.message} — simulation fallback`);
      this.logger.log(`[SMS SIMULATION FALLBACK] To: ${to} | Body: ${body}`);
      return { simulated: true, to, body, error: e.message };
    }
  }

  async sendOtpSms(to: string, code: string) {
    const body = `Your AgroTech verification code is ${code}. Expires in 5 minutes. If you didn't request this, ignore.`;
    return this.sendSms(to, body);
  }
}
