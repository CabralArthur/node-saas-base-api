import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';

import { Subscription } from '../entities/subscription.entity';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private configService: ConfigService,
  ) {}

  async handle(event: any) {
    switch (event.type) {
      case 'customer.subscription.deleted':
      case 'customer.subscription.canceled':
        await this.subscriptionRepository.update(
          { stripeCustomerId: event.data.object.customer },
          { status: 'CANCELED', updatedAt: new Date() }
        );
        break;

      case 'customer.subscription.created': {
        const subscription = await this.subscriptionRepository.findOne({
          where: {
            stripeCustomerId: event.data.object.customer
          }
        });

        const planId = event.data.object.items.data[0].price.id;
        const updateData = {
          status: 'ACTIVE',
          stripeSubscriptionId: event.data.object.id,
          stripePriceId: planId,
          endsAt: dayjs.unix(event.data.object.current_period_end).toDate(),
          paidAt: dayjs.unix(event.data.object.created).toDate(),
          updatedAt: new Date(),
        };

        if (planId === this.configService.get('STRIPE_YEARLY_PRICE_ID')) {
          updateData['planId'] = this.configService.get('STRIPE_YEARLY_DB_PLAN_ID');
        } else {
          updateData['planId'] = this.configService.get('STRIPE_MONTHLY_DB_PLAN_ID');
        }

        await Promise.all([
          this.subscriptionRepository.update(subscription.id, updateData),
          this.paymentRepository.save(this.paymentRepository.create({
            subscriptionId: subscription.id,
            status: 'PAID',
            amount: 0,
            currency: 'EUR',
            paymentMethod: event.data.object.payment_method_types?.[0] || 'CARD',
            stripePaymentId: event.data.object.payment_intent,
            paidAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        ]);
        break;
      }

      case 'invoice.payment_failed': {
        const subscription = await this.subscriptionRepository.findOne({
          where: {
            stripeCustomerId: event.data.object.customer
          }
        });

        await Promise.all([
          this.subscriptionRepository.update(subscription.id, {
            status: 'OVERDUE',
            updatedAt: new Date(),
          }),
          this.paymentRepository.save(this.paymentRepository.create({
            subscriptionId: subscription.id,
            amount: event.data.object.amount_due / 100,
            currency: event.data.object.currency.toUpperCase(),
            status: 'FAILED',
            paymentMethod: event.data.object.payment_method_types[0],
            stripePaymentId: event.data.object.payment_intent,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        ]);
        break;
      }

      case 'invoice.payment_succeeded': {
        const subscription = await this.subscriptionRepository.findOne({
          where: {
            stripeCustomerId: event.data.object.customer
          }
        });

        const updateData = {
          status: 'ACTIVE',
          stripePriceId: event.data.object.lines.data[0].price.id,
          paidAt: dayjs.unix(event.data.object.created).toDate(),
          updatedAt: new Date(),
        };

        const latestPayment = await this.paymentRepository.findOne({
          where: {
            subscriptionId: subscription.id,
            deletedAt: null
          },
          order: {
            createdAt: 'DESC'
          }
        });

        await Promise.all([
          this.subscriptionRepository.update(subscription.id, updateData),
          this.paymentRepository.update(latestPayment.id, {
            invoiceLink: event.data.object.hosted_invoice_url,
            amount: event.data.object.amount_paid / 100,
            currency: event.data.object.currency.toUpperCase(),
            status: 'PAID',
            stripePaymentId: event.data.object.payment_intent,
            paidAt: dayjs.unix(event.data.object.created).toDate(),
            updatedAt: new Date(),
          })
        ]);
        break;
      }

      case 'customer.subscription.updated': {
        const existentSubscription = await this.subscriptionRepository.findOne({
          where: {
            stripeCustomerId: event.data.object.customer
          }
        });

        if (existentSubscription && event.data.object.cancel_at_period_end) {
          await this.subscriptionRepository.update(existentSubscription.id, {
            status: 'CANCELED',
            canceledAt: new Date(),
            endsAt: new Date(),
            updatedAt: new Date(),
          });
        }

        if (existentSubscription && existentSubscription.canceledAt && !event.data.object.cancel_at_period_end) {
          await this.subscriptionRepository.update(existentSubscription.id, {
            status: 'ACTIVE',
            canceledAt: null,
            updatedAt: new Date(),
          });
        }
        break;
      }

      default:
        break;
    }

    return true;
  }
} 