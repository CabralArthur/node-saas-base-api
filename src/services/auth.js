import bcrypt from 'bcrypt';
import { pick } from 'lodash';
import { UserService } from '@services';
import { AuthUtils, ExceptionUtils } from '@utils';
import httpStatus from 'http-status';

export default class AuthService {
	constructor() {
		this.userService = new UserService();
	}

	async login({ email, password }) {
		let isFakeUser = false;
		const FAKE_PASSWORD = '$2a$10$4NNIgYdnWkr4B30pT5i3feDEzWivfxyOK.oNSxk7G3GzGAVfB6vEC';

		let user = await this.userService.getExistentUser(email);

		if (!user || !user.teamId) {
			isFakeUser = true;

			user = {
				id: 1,
				password: FAKE_PASSWORD
			};
		}

		const isValidPassword = bcrypt.compareSync(password, user.password);

		if (!isValidPassword || isFakeUser) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_CREDENTIALS',
				message: 'Credenciais inválidas'
			});
		}

		return AuthUtils.getTokenData(pick(user, ['id', 'name', 'email', 'isAdmin', 'teamId']));
	}
}
