import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import * as dayjs from 'dayjs';

import { Subscription } from '../entities/subscription.entity';
import { Plan } from '../entities/plan.entity';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  private readonly defaultPlanId: number = 1; // Monthly plan

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCustomer(email: string, name: string) {
    return await this.stripe.customers.create({ email, name });
  }

  async subscribeTrial(data: { email: string; name: string; userId: number; teamId: number }) {
    const { email, name, userId, teamId } = data;
    const customer = await this.createCustomer(email, name);

    const subscription = this.subscriptionRepository.create({
      stripeCustomerId: customer.id,
      teamId,
      userId,
      planId: this.defaultPlanId,
      status: 'TRIAL',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.subscriptionRepository.save(subscription);
    return true;
  }

  async getSubscription(teamId: number, options: { extraAttributes?: (keyof Subscription)[] } = {}) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { teamId },
      select: ['status', 'createdAt', ...(options.extraAttributes || [])],
    });

    return subscription;
  }

  async cancel(teamId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        teamId,
        status: 'ACTIVE',
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new HttpException('Subscription not found', HttpStatus.BAD_REQUEST);
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.subscriptionRepository.update(subscription.id, {
      status: 'CANCELED',
      canceledAt: dayjs().toDate(),
      updatedAt: new Date(),
    });

    return true;
  }

  async renew(teamId: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        teamId,
        status: 'CANCELED',
      },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new HttpException('Subscription not found', HttpStatus.BAD_REQUEST);
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await this.subscriptionRepository.update(subscription.id, {
      status: 'ACTIVE',
      canceledAt: null,
      updatedAt: new Date(),
    });

    return true;
  }

  async checkout(teamId: number, data: { planModel: string }) {
    const { planModel } = data;
    const subscription = await this.getSubscription(teamId, { extraAttributes: ['stripeCustomerId'] });

    if (subscription.status === 'ACTIVE') {
      throw new HttpException('Subscription already exists', HttpStatus.BAD_REQUEST);
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      success_url: `${this.configService.get('CLIENT_BASE_URL')}/team/settings`,
      cancel_url: `${this.configService.get('CLIENT_BASE_URL')}/team/settings`,
      line_items: [
        { 
          price: this.configService.get(`STRIPE_${planModel.toUpperCase()}_PRICE_ID`),
          quantity: 1 
        }
      ],
      mode: 'subscription',
    });

    return session;
  }
} 