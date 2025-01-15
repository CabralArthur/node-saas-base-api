import Stripe from 'stripe';
import BaseController from './base';
import { WebhookService } from '@services';

class WebhookController extends BaseController {
	constructor() {
		super();

		this.webhookService = new WebhookService();
		this.handle = this.handle.bind(this);
		this.stripe = new Stripe(process.env.STRIPE_API_KEY);
	}

	async handle(req, res) {
		try {
			const event = this.stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);

			const response = await this.webhookService.handle(event);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default WebhookController;
