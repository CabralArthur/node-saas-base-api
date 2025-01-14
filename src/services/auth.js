import bcrypt from 'bcrypt';
import { pick } from 'lodash';
import { User, Team, Member } from '@models';
import { UserService, EmailService } from '@services';
import { AuthUtils, ExceptionUtils } from '@utils';
import httpStatus from 'http-status';
import Database from '@database';

export default class AuthService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
		this.emailService = new EmailService();
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
				message: 'Invalid credentials'
			});
		}

		return AuthUtils.getTokenData(pick(user, ['id', 'name', 'email', 'isAdmin', 'teamId']));
	}

	async register(data) {
		const user = await this.userService.getExistentUser(data.email);

		if (user) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'NOT_PERMISSION',
				message: 'Invalid user informations.'
			});
		}

		if (!AuthUtils.isValidPasswordStrength(data.password)) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_PASSWORD',
				message: 'Invalid user password.'
			});
		}

		const transaction = await this.database.masterInstance.transaction();

		try {
			const createdUser = await User.create(data, { transaction, returning: true, raw: true });

			const createdTeam = await Team.create({
				name: `${createdUser.name}'s Team`,
				description: `Team of ${createdUser.name}`,
			}, {
				transaction
			});

			await Member.create({
				userId: createdUser.id,
				teamId: createdTeam.id,
				isAdmin: true,
				creatorId: createdUser.id
			}, { transaction });

			await this.sendVerificationEmail(createdUser);

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async sendVerificationEmail(user) {
		const { token } = await AuthUtils.getTokenData(pick(user, ['id', 'name', 'email', 'isAdmin', 'teamId']));

		const emailOptions = {
			to: user.email,
			from: process.env.EMAIL_FROM,
			subject: 'Account Verification',
			text: `To verify your account, click on the link: ${process.env.CLIENT_BASE_URL}/verify-email?token=${token}`,
			html: `To verify your account, click on the link: <a href="${process.env.CLIENT_BASE_URL}/verify-email?token=${token}">Verify Account</a>`
		};

		this.emailService.send(emailOptions);
	}

	async verifyEmail({ token }) {
		const decodedToken = AuthUtils.decodeData(token, process.env.APP_SECRET_KEY);

		if (!decodedToken) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_TOKEN',
				message: 'Invalid token'
			});
		}

		await User.update({
			isEmailVerified: true
		}, {
			where: {
				id: decodedToken.user.id
			}
		});

		return true;
	}
}
