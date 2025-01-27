import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';

export interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      console.warn('SendGrid API key not found');
      return;
    }
    SendGrid.setApiKey(apiKey);
  }

  async send(options: EmailOptions) {
    try {
      const transport = await SendGrid.send(options);
      return transport;
    } catch (err) {
      console.error('Error sending email:', err);
      throw err;
    }
  }
} 