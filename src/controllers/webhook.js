import Stripe from 'stripe';
import BaseController from './base';
import { WebhookService } from '@services';
import config from '../config/config';

class WebhookController extends BaseController {
	constructor() {
		super();

		this.webhookService = new WebhookService();
		this.handle = this.handle.bind(this);
		this.stripe = new Stripe(config.stripe.apiKey);
	}

	async handle(req, res) {
		try {
			const event = this.stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], config.stripe.webhookSecret);

			const response = await this.webhookService.handle(event);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default WebhookController;
