import Database from '@database';
import { get, map } from 'lodash';
import {
	User,
	Member,
	UserLog,
	UserPermission,
	Permission,
	PermissionModule
} from '@models';
import { AuthUtils, ExceptionUtils } from '@utils';
import { LogConstants } from '@constants';
import httpStatus from 'http-status';
import { hashSync, compareSync } from 'bcrypt';

export default class UserService {
	constructor() {
		this.database = new Database();
	}

	async getExistentUser(userEmail) {
		let existentUser = await User.findOne({
			where: {
				email: userEmail,
				is_deleted: false
			},
			include: {
				model: Member,
				required: true,
				where: {
					is_deleted: false
				},
				attributes: ['teamId', 'isAdmin']
			},
			attributes: ['id', 'name', 'email', 'isEmailVerified', 'password']
		});

		if (!existentUser) {
			return null;
		}

		existentUser = existentUser.get({ plain: true });

		return {
			id: existentUser.id,
			name: existentUser.name,
			email: existentUser.email,
			password: existentUser.password,
			isAdmin: existentUser.member.isAdmin,
			teamId: existentUser.member.teamId,
			isEmailVerified: existentUser.isEmailVerified
		};
	}

	async list(filter) {
		const users = await User.findAll({
			where: {
				isDeleted: false
			},
			include: {
				model: Member,
				where: {
					teamId: filter.teamId,
					isDeleted: false
				},
				attributes: ['isAdmin']
			},
			attributes: ['id', 'name', 'email']
		});

		return map(users, user => {
			user = user.get({ plain: true });

			return {
				id: user.id,
				name: user.name,
				email: user.email,
				isAdmin: user.member.isAdmin
			};
		});
	}

	async find(filter, options) {
		let user = await User.findOne({
			where: {
				id: filter.id,
				isDeleted: false
			},
			include: [{
				model: Member,
				where: {
					teamId: filter.teamId,
					isDeleted: false
				},
				attributes: ['isAdmin']
			}],
			attributes: ['id', 'name', 'email', ...(options?.extra_attributes || [])]
		});

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'USER_NOT_FOUND',
				message: 'User not found.'
			});
		}

		user = user.get({ plain: true });

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			password: user.password || null,
			isAdmin: user.member.isAdmin
		};
	}

	async getInfo(filter) {
		const user = await User.findOne({
			where: { id: filter.id },
			attributes: ['id', 'name', 'email'],
		});

		if (!user) {
			throw new ExceptionUtils({
				status: httpStatus.FORBIDDEN,
				code: 'USER_NOT_FOUND',
				message: 'User not found.'
			});
		}

		return user;
	}

	async getUpdateActionUsers(id, meta) {
		const options = {
			editor: {
				filter: { id: meta.loggedUserId, teamId: meta.teamId },
			},
			user: {
				filter: { id, teamId: meta.teamId },
				options: { extra_attributes: ['password'] }
			}
		};

		const { editor, user } = options;

		const [editorUser, userToEdit] = await Promise.all([this.find(editor.filter, editor.options), this.find(user.filter, user.options)]);

		return { editor: editorUser, user: userToEdit };
	}

	validateCanChangePassword({ data, user, editor }) {
		const isSameUser = user.id === editor.id;
		const isTryingToChangePassword = data.oldPassword && data.newPassword;

		if (!isSameUser && isTryingToChangePassword) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'NOT_PERMISSION',
				message: 'You do not have permission to change another user\'s password.'
			});
		}

		return true;
	}

	validateIsOldPasswordValid({ data, user }) {
		const isValidPassword = data.oldPassword && compareSync(data.oldPassword, user.password) || false;

		if (data.newPassword && !isValidPassword) {
			throw new ExceptionUtils({
				status: httpStatus.UNAUTHORIZED,
				code: 'INVALID_PASSWORD',
				message: 'Invalid user password.'
			});
		}

		return true;
	}

	async validateIsEmailChangeValid({ data, user }) {
		const isChangingEmail = user.email !== data.email;

		if (isChangingEmail) {
			const user = await this.getExistentUser(data.email);

			if (user) {
				throw new ExceptionUtils({
					status: httpStatus.CONFLICT,
					code: 'USER_ALREADY_EXISTS',
					message: 'User already exists.'
				});
			}
		}

		return true;
	}

	valiteIsNewPasswordValid({ data }) {
		const isChangingPassword = data.oldPassword && data.newPassword;
		const isInvalidPassword = !AuthUtils.isValidPasswordStrength(data.newPassword);

		if (isChangingPassword && isInvalidPassword) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'INVALID_PASSWORD',
				message: 'Invalid user password.'
			});
		}

		const isSamePassword = data.newPassword && (data.oldPassword === data.newPassword);

		if (isSamePassword) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'SAME_PASSWORD',
				message: 'New password must be different from the old password.'
			});
		}

		return true;
	}

	async validateUserUpdate({ id, data, meta }) {
		const { editor, user } = await this.getUpdateActionUsers(id, meta);

		await this.validateIsEmailChangeValid({ data, user });

		this.validateCanChangePassword({ data, user, editor });
		this.validateIsOldPasswordValid({ data, user });
		this.valiteIsNewPasswordValid({ data });

		return true;
	}

	async update({ id, data, meta }) {
		await this.validateUserUpdate({ id, data, meta });

		const transaction = await this.database.masterInstance.transaction();

		try {
			if (data.newPassword) {
				data.password = hashSync(data.newPassword, 8);
			}

			const user = await User.update(data, {
				where: {
					id,
					isDeleted: false
				},
				transaction,
				returning: true,
				raw: true
			});

			await UserLog.create({
				type: LogConstants.UPDATE_USER,
				userId: meta.loggedUserId,
				teamId: meta.teamId,
				targetUserId: id
			}, { transaction });

			await transaction.commit();

			return get(user, '[1][0]');
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	async delete({ id, meta }) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			await User.update({
				isDeleted: true
			}, {
				where: {
					id,
					isDeleted: false
				},
				transaction
			});

			await Member.update({
				isDeleted: true,
				destroyerId: meta.loggedUserId
			}, {
				where: {
					userId: id,
					isDeleted: false
				},
				transaction
			});

			await UserLog.create({
				type: LogConstants.DELETE_USER,
				userId: meta.loggedUserId,
				teamId: meta.teamId,
				targetUserId: id
			}, { transaction });

			await transaction.commit();

			return true;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}

	mountUserPermission(permission) {
		return {
			id: permission.id,
			name: permission?.permission?.key,
			module: permission?.permission?.module?.key
		};
	}

	getParsedUserInfoUser(user) {
		user = user.get({ plain: true });

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			isAdmin: user.member.isAdmin,
			permissions: map(user.permissions, permission => this.mountUserPermission(permission))
		};
	}

	async info(filter) {
		const user = await User.findOne({
			where: {
				id: filter.id,
				isDeleted: false
			},
			include: [{
				model: Member,
				where: {
					userId: filter.id,
					teamId: filter.teamId,
					isDeleted: false
				},
				attributes: ['isAdmin']
			}, {
				model: UserPermission,
				where: {
					teamId: filter.teamId,
					userId: filter.id,
					isDeleted: false
				},
				required: false,
				attributes: ['id'],
				as: 'permissions',
				include: {
					model: Permission,
					where: {
						isDeleted: false
					},
					required: false,
					attributes: ['key'],
					include: {
						model: PermissionModule,
						as: 'module',
						where: {
							isDeleted: false
						},
						required: false,
						attributes: ['key']
					}
				}
			}],
			attributes: ['id', 'name', 'email']
		});

		if (!user) {
			return null;
		}

		return this.getParsedUserInfoUser(user);
	}

	async getPermissions(filter) {
		const user = await User.findOne({
			where: { id: filter.id },
			attributes: ['id', 'name', 'email']
		});

		if (!user) {
			return {
				permissions: []
			};
		}

		const permissions = await UserPermission.findAll({
			where: {
				userId: filter.id,
				teamId: filter.teamId,
				isDeleted: false
			},
			include: {
				model: Permission,
				where: {
					isDeleted: false
				},
				required: false,
				attributes: ['key'],
				include: {
					model: PermissionModule,
					as: 'module',
					where: {
						isDeleted: false
					},
					required: false,
					attributes: ['key']
				}
			}
		});

		return {
			userId: filter.id,
			permissions: map(permissions, permission => this.mountUserPermission(permission))
		};
	}
}
