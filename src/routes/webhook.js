import BaseRoutes from './base';
import { WebhookController } from '@controllers';

export default class WebhookRoutes extends BaseRoutes {
	constructor() {
		super();

		this.webhookController = new WebhookController();
	}

	setup() {
		this.router.post('/', this.webhookController.handle);

		return this.router;
	}
}

