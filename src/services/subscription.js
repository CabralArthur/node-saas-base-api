import Stripe from 'stripe';
import { Subscription } from '@models';
import { DEFAULT_PLAN } from '@constants/subscription';

export default class SubscriptionService {
	constructor() { }

	async createCustomer(email, name) {
		const stripe = new Stripe(process.env.STRIPE_API_KEY);

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

	async checkout(teamId) {
		const stripe = new Stripe(process.env.STRIPE_API_KEY);
		const subscription = await this.getSubscription(teamId, { extraAttributes: ['stripeCustomerId'] });

		const session = await stripe.checkout.sessions.create({
			customer: subscription.stripeCustomerId,
			success_url: `${process.env.CLIENT_BASE_URL}/checkout-success`,
			cancel_url: `${process.env.CLIENT_BASE_URL}/checkout-cancel`,
			line_items: [{ price: DEFAULT_PLAN.stripeId, quantity: 1 }],
			mode: 'subscription',
		});

		return session;
	}
}


