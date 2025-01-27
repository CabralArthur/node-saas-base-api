import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { SubscriptionController } from './controllers/subscription.controller';
import { WebhookController } from './controllers/webhook.controller';
import { SubscriptionService } from './services/subscription.service';
import { WebhookService } from './services/webhook.service';
import { Subscription } from './entities/subscription.entity';
import { Plan } from './entities/plan.entity';
import { Payment } from './entities/payment.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Plan, Payment]),
    ConfigModule,
  ],
  controllers: [SubscriptionController, WebhookController],
  providers: [SubscriptionService, WebhookService, JwtService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {} 