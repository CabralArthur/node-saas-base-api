import BaseController from './base';
import { AuthService } from '@services';

class AuthController extends BaseController {
	constructor() {
		super();

		this.authService = new AuthService();
		this.login = this.login.bind(this);
	}

	async login(req, res) {
		try {
			const response = await this.authService.login(req.data);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default AuthController;
