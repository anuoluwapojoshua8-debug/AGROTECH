import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    const isConfigured = host && user && pass && !host.includes('sendgrid') || (host && user !== 'apikey');
    // Always try to create transporter if host is set; otherwise fallback to logger simulation
    if (host && user && pass && host !== 'smtp.sendgrid.net') {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      } as any);
    } else if (host && user && pass) {
      // SendGrid via SMTP
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: false,
        auth: { user, pass },
      } as any);
    } else {
      this.logger.warn('SMTP not configured — emails will be logged instead of sent');
    }
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const from = this.configService.get<string>('SMTP_FROM', 'AgroTech <noreply@agrotech.ng>');
    if (!this.transporter) {
      this.logger.log(`[MAIL SIMULATION] To: ${to} | Subject: ${subject}\n${html}`);
      return { simulated: true, to, subject };
    }
    try {
      const info = await this.transporter.sendMail({ from, to, subject, html, text });
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${to}: ${err.message} — falling back to simulation log`);
      this.logger.log(`[MAIL SIMULATION FALLBACK] To: ${to} | Subject: ${subject}\n${html}`);
      return { simulated: true, to, subject, error: err.message };
    }
  }

  async sendPasswordResetEmail(to: string, resetUrl: string, userName?: string) {
    const subject = 'Reset your AgroTech password';
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:16px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <div style="width:36px;height:36px;background:#0a7a3c;border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-weight:700">A</div>
          <span style="font-size:20px;font-weight:700">Agro<span style="color:#0a7a3c">Tech</span></span>
        </div>
        <h2 style="color:#111827">Hi ${userName || 'there'},</h2>
        <p style="color:#4b5563;line-height:1.6">You requested to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:20px 0;padding:12px 24px;background:#0a7a3c;color:white;text-decoration:none;border-radius:10px;font-weight:600">Reset Password</a>
        <p style="color:#6b7280;font-size:13px">Or copy this link: <br/><span style="word-break:break-all;color:#0a7a3c">${resetUrl}</span></p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center">© ${new Date().getFullYear()} AgroTech Marketplace — Fresh from farm to table</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendOrderConfirmation(to: string, orderNumber: string, total: number, userName?: string) {
    const subject = `Order ${orderNumber} confirmed — AgroTech`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2>Thanks ${userName || ''}! Your order is confirmed 🎉</h2>
        <p>Order <strong>#${orderNumber}</strong> for <strong>₦${total.toLocaleString()}</strong> has been received. We'll notify you when it ships.</p>
        <p style="color:#6b7280;font-size:13px">Track at ${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/orders</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}
