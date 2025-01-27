import { Controller, Post, Body, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from '../services/webhook.service';
import { Public } from '../../auth/decorators/public.decorator';
import Stripe from 'stripe';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  @Post('webhook')
  @Public()
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Body() rawBody: Buffer,
  ) {
    if (!signature) {
      throw new HttpException('No signature found', HttpStatus.BAD_REQUEST);
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );

      await this.webhookService.handle(event);
      return { received: true };
    } catch (err) {
      throw new HttpException(
        `Webhook Error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
} 