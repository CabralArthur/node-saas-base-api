import Stripe from 'stripe';
import { Subscription } from '@models';
import { DEFAULT_PLAN } from '@constants/subscription';
import config from '../config/config';
import { ExceptionUtils } from '@utils';
import dayjs from 'dayjs';

export default class SubscriptionService {
	constructor() { }

	async createCustomer(email, name) {
		const stripe = new Stripe(config.stripe.apiKey);

		const customer = await stripe.customers.create({ email, name });

		return customer;
	}

	async subscribeTrial(data, meta) {
		const { email, name, userId, teamId } = data;
		const customer = await this.createCustomer(email, name);

		await Subscription.create({
			stripeCustomerId: customer.id,
			teamId,
			userId: userId,
			planId: DEFAULT_PLAN.id,
			status: 'TRIAL',
		}, { transaction: meta.transaction });

		return true;
	}

	async getSubscription(teamId, options = {}) {
		return await Subscription.findOne({ where: { teamId }, attributes: ['status', 'createdAt', ...(options.extraAttributes || [])] }, { raw: true });
	}

	async cancel(teamId) {
		const subscription = await Subscription.findOne({
			where: {
				team_id: teamId,
				status: 'ACTIVE',
			}
		});

		if (!subscription || !subscription.stripeSubscriptionId) {
			throw new ExceptionUtils({
				message: 'Subscription not found',
				code: 'SUBSCRIPTION_NOT_FOUND',
				status: 400
			});
		}

		const stripe = new Stripe(config.stripe.apiKey);
		await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
			cancel_at_period_end: true
		});

		await subscription.update({
			status: 'CANCELED',
			canceledAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
		});

		return true;
	}

	async renew(teamId) {
		const subscription = await Subscription.findOne({
			where: {
				team_id: teamId,
				status: 'CANCELED',
			}
		});

		if (!subscription || !subscription.stripeSubscriptionId) {
			throw new ExceptionUtils({
				message: 'Subscription not found',
				code: 'SUBSCRIPTION_NOT_FOUND',
				status: 400
			});
		}

		const stripe = new Stripe(config.stripe.apiKey);

		await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
			cancel_at_period_end: false
		});

		return true;
	}

	async checkout(teamId, data) {
		const { planModel } = data;
		const stripe = new Stripe(config.stripe.apiKey);
		const subscription = await this.getSubscription(teamId, { extraAttributes: ['stripeCustomerId'] });

		if (subscription.status === 'ACTIVE') {
			throw new ExceptionUtils({
				message: 'Subscription already exists',
				code: 'SUBSCRIPTION_ALREADY_EXISTS',
				status: 400
			});
		}

		const session = await stripe.checkout.sessions.create({
			customer: subscription.stripeCustomerId,
			success_url: `${config.client.baseUrl}/team/settings`,
			cancel_url: `${config.client.baseUrl}/team/settings`,
			line_items: [{ price: config.stripe[planModel], quantity: 1 }],
			mode: 'subscription',
		});

		return session;
	}
}


