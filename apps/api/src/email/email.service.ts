import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Resend } from 'resend';

interface AccountInvitation {
  to: string;
  employeeName?: string;
  rawToken: string;
  expiresAt: Date;
}

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly webAppUrl: URL;

  constructor() {
    this.resend = new Resend(this.requireEnvironment('RESEND_API_KEY'));
    this.fromEmail = this.requireEnvironment('RESEND_FROM_EMAIL');
    this.webAppUrl = this.parseWebAppUrl(this.requireEnvironment('WEB_APP'));
  }

  async sendAccountInvitation(input: AccountInvitation): Promise<void> {
    const activationUrl = new URL('/activate', this.webAppUrl);
    activationUrl.searchParams.set('token', input.rawToken);

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: input.to,
      subject: 'Activate your HR Management account',
      html: this.renderAccountInvitation({
        employeeName: input.employeeName,
        activationUrl: activationUrl.toString(),
        expiresAt: input.expiresAt,
      }),
      text: this.renderAccountInvitationText({
        employeeName: input.employeeName,
        activationUrl: activationUrl.toString(),
        expiresAt: input.expiresAt,
      }),
    });

    if (error) {
      throw new ServiceUnavailableException(
        'The invitation email could not be sent. Try again.',
      );
    }
  }

  private renderAccountInvitation(input: {
    employeeName?: string;
    activationUrl: string;
    expiresAt: Date;
  }) {
    const greeting = input.employeeName
      ? `Hello ${this.escapeHtml(input.employeeName)},`
      : 'Hello,';
    const activationUrl = this.escapeHtml(input.activationUrl);
    const expiration = this.escapeHtml(this.formatExpiration(input.expiresAt));

    return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f1f5f9;color:#0f172a;font-family:Arial,sans-serif">
    <div style="padding:32px 16px">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="padding:24px 28px;border-bottom:1px solid #e2e8f0">
          <div style="font-size:18px;font-weight:700">HR Management</div>
        </div>
        <div style="padding:28px">
          <p style="margin:0 0 16px;font-size:16px">${greeting}</p>
          <h1 style="margin:0 0 12px;font-size:24px;line-height:32px">Activate your account</h1>
          <p style="margin:0 0 24px;color:#475569;line-height:24px">An HR Management account was created for you. Set your password to activate it and access your employee workspace.</p>
          <a href="${activationUrl}" style="display:inline-block;padding:11px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:7px;font-weight:600">Activate account</a>
          <p style="margin:24px 0 0;color:#475569;font-size:14px;line-height:22px">This activation link expires ${expiration}. If you were not expecting this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
  }

  private renderAccountInvitationText(input: {
    employeeName?: string;
    activationUrl: string;
    expiresAt: Date;
  }) {
    const greeting = input.employeeName
      ? `Hello ${input.employeeName},`
      : 'Hello,';

    return `${greeting}\n\nAn HR Management account was created for you. Activate your account and set your password using this link:\n\n${input.activationUrl}\n\nThis link expires ${this.formatExpiration(input.expiresAt)}. If you were not expecting this invitation, you can safely ignore this email.`;
  }

  private formatExpiration(value: Date) {
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    }).format(value);
  }

  private requireEnvironment(name: string) {
    const value = process.env[name]?.trim();

    if (!value) {
      throw new Error(`${name} is not configured.`);
    }

    return value;
  }

  private parseWebAppUrl(value: string) {
    let url: URL;

    try {
      url = new URL(value);
    } catch {
      throw new Error('WEB_URL must be a valid URL.');
    }

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('WEB_URL must use HTTP or HTTPS.');
    }

    return url;
  }

  private escapeHtml(value: string) {
    return value.replace(
      /[&<>'"]/g,
      (character) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;',
        })[character] ?? character,
    );
  }
}
