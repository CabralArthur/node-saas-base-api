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
		this.router.post('/register', this.SchemaValidator.validate(AuthSchema.register), this.authController.register);
		this.router.get('/verify-email', this.SchemaValidator.validate(AuthSchema.verifyEmail), this.authController.verifyEmail);

		return this.router;
	}
}

export default AuthRoutes;
