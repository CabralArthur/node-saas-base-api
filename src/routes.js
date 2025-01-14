import { Router } from 'express';
import {
	AuthRoutes,
	UserRoutes,
	SubscriptionRoutes
} from '@routes';

import {
	AuthMiddleware,
} from '@middlewares';

class Routes {
	constructor() {
		this.routes = new Router();
		this.authRoutes = new AuthRoutes();
		this.userRoutes = new UserRoutes();
		this.subscriptionRoutes = new SubscriptionRoutes();
	}

	setup() {
		this.routes.get('/health', (req, res) => res.status(200).send('OK'));
		this.routes.use('/auth', this.authRoutes.setup());
		this.routes.use('/user', AuthMiddleware.isAuthorized, this.userRoutes.setup());
		this.routes.use('/subscription', AuthMiddleware.isAuthorized, this.subscriptionRoutes.setup());

		this.routes.use((error, req, res, next) => {
			if (error) {
				res.status(500).json({
					status: 'error',
					message: 'Algo de errado aconteceu'
				});
				return;
			}

			next();
		});

		return this.routes;
	}
}

export default Routes;
