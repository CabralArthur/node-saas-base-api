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
}
