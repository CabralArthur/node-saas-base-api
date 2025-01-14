import BaseController from './base';
import { SubscriptionService } from '@services';

class SubscriptionController extends BaseController {
	constructor() {
		super();

		this.subscriptionService = new SubscriptionService();
		this.getSubscription = this.getSubscription.bind(this);
		this.checkout = this.checkout.bind(this);
	}

	async getSubscription(req, res) {
		try {
			const response = await this.subscriptionService.getSubscription(req.auth.teamId);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async checkout(req, res) {
		try {
			const response = await this.subscriptionService.checkout(req.auth.teamId);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default SubscriptionController;
