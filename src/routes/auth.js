import BaseRoutes from './base';
import { AuthSchema } from '@schemas';
import { AuthController } from '@controllers';

class AuthRoutes extends BaseRoutes {
	constructor() {
		super();

		this.authController = new AuthController();
	}

	setup() {
		this.router.post('/login', this.SchemaValidator.validate(AuthSchema.login), this.authController.login);

		return this.router;
	}
}

export default AuthRoutes;
