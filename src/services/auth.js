import bcrypt from 'bcrypt';
import { pick } from 'lodash';
import httpStatus from 'http-status';
import Database from '@database';
import { UserService, EmailService, SubscriptionService } from '@services';
import { AuthUtils, ExceptionUtils } from '@utils';
import { User, UserRecoverPassword, Team, Member, UserPermission } from '@models';
import PermissionConstants from '@constants/permission';
import config from '../config/config';

export default class AuthService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
		this.emailService = new EmailService();
		this.subscriptionService = new SubscriptionService();
	}

	async login({ email, password }) {
		let isFakeUser = false;
		const FAKE_PASSWORD = '$2a$10$4NNIgYdnWkr4B30pT5i3feDEzWivfxyOK.oNSxk7G3GzGAVfB6vEC';

		let user = await this.userService.getExistentUser(email);

		if (!user.isEmailVerified) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'EMAIL_NOT_VERIFIED',
				message: 'Please verify your email before logging in.'
			});
		}

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

		if (!user.isEmailVerified) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'EMAIL_NOT_VERIFIED',
				message: 'Email not verified'
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

			const { READ, CREATE, UPDATE, DELETE } = PermissionConstants.PERMISSION_MODULE_ID_BY_NAME.TASKS;

			const defaultPermissions = [
				{ permissionId: READ, userId: createdUser.id, creatorId: createdUser.id, teamId: createdTeam.id },
				{ permissionId: CREATE, userId: createdUser.id, creatorId: createdUser.id, teamId: createdTeam.id },
				{ permissionId: UPDATE, userId: createdUser.id, creatorId: createdUser.id, teamId: createdTeam.id },
				{ permissionId: DELETE, userId: createdUser.id, creatorId: createdUser.id, teamId: createdTeam.id },
			];

			await UserPermission.bulkCreate(defaultPermissions, { transaction });

			await this.subscriptionService.subscribeTrial({
				email: createdUser.email,
				name: createdUser.name,
				userId: createdUser.id,
				teamId: createdTeam.id,
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
			from: config.email.from,
			subject: 'Account Verification',
			text: `To verify your account, click on the link: ${config.client.baseUrl}/verify-email?token=${token}`,
			html: `To verify your account, click on the link: <a href="${config.client.baseUrl}/verify-email?token=${token}">Verify Account</a>`
		};

		this.emailService.send(emailOptions);
	}

	async verifyEmail({ token }) {
		const decodedToken = AuthUtils.decodeData(token, config.app.secretKey);

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

	async requestResetPassword({ email }) {
		const user = await this.userService.getExistentUser(email);

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found'
			});
		}

		const transaction = await this.database.masterInstance.transaction();

		try {
			const token = await AuthUtils.generateRandomToken();

			await UserRecoverPassword.create({
				used: false,
				token: token,
				userId: user.id
			}, { transaction });

			const link = `${config.client.baseUrl}/reset-password/${token}`;

			const emailOptions = {
				to: user.email,
				from: config.email.from,
				subject: 'Password Reset Request',
				text: `To reset your password, click on the link: ${link}`,
				html: `To reset your password, click on the link: <a href="${link}">Reset Password</a>`
			};

			await this.emailService.send(emailOptions);

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async validateResetPassword({ token, options = {} }) {
		const userRecoverPassword = await UserRecoverPassword.findOne({
			where: {
				token,
				used: false
			},
			raw: true
		});

		if (!userRecoverPassword) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'INVALID_TOKEN',
				message: 'Invalid token'
			});
		}

		if (!options.returnData) {
			return true;
		}

		return userRecoverPassword;
	}

	async resetPassword({ token, password }) {
		const userRecoverPassword = await this.validateResetPassword({ token, options: { returnData: true } });

		if (!userRecoverPassword) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found'
			});
		}

		if (!AuthUtils.isValidPasswordStrength(password)) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_PASSWORD',
				message: 'Invalid user password.'
			});
		}

		const hashedPassword = bcrypt.hashSync(password, 10);

		const transaction = await this.database.masterInstance.transaction();

		try {
			await User.update({
				password: hashedPassword
			}, {
				where: {
					id: userRecoverPassword.userId
				},
				transaction
			});

			await UserRecoverPassword.update({
				used: true
			}, {
				where: {
					id: userRecoverPassword.id
				},
				transaction
			});

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
}
