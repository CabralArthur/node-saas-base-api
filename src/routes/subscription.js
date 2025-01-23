import BaseRoutes from './base';
import { AdminUserMiddleware } from '@middlewares';
import { SubscriptionController } from '@controllers';
import { SubscriptionSchema } from '@schemas';
export default class SubscriptionRoutes extends BaseRoutes {
	constructor() {
		super();

		this.subscriptionController = new SubscriptionController();
	}

	setup() {
		this.router.get('/', this.subscriptionController.getSubscription);
		this.router.post('/checkout', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(SubscriptionSchema.checkout), this.subscriptionController.checkout);
		this.router.post('/cancel', AdminUserMiddleware.isAuthorized, this.subscriptionController.cancel);
		this.router.post('/renew', AdminUserMiddleware.isAuthorized, this.subscriptionController.renew);

		return this.router;
	}
}

