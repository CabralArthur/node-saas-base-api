import BaseRoutes from './base';
import { AdminUserMiddleware } from '@middlewares';
import { SubscriptionController } from '@controllers';

export default class SubscriptionRoutes extends BaseRoutes {
	constructor() {
		super();

		this.subscriptionController = new SubscriptionController();
	}

	setup() {
		this.router.get('/', this.subscriptionController.getSubscription);
		this.router.post('/checkout', AdminUserMiddleware.isAuthorized, this.subscriptionController.checkout);

		return this.router;
	}
}

