import Database from '@database';
import { get, map } from 'lodash';
import {
	User,
	Member,
	Subscription,
	UserLog,
	UserPermission,
	Permission,
	PermissionModule,
	Team
} from '@models';
import { ExceptionUtils } from '@utils';
import { LogConstants } from '@constants';
import httpStatus from 'http-status';
import { hashSync, compareSync } from 'bcrypt';
import { PermissionConstants } from '@constants';

export default class UserService {
	constructor() {
		this.database = new Database();
	}

	mountPermissionsToCreate({ permissions, filter }) {
		return permissions.map(permission => {
			const permissionId = PermissionConstants.PERMISSION_MODULE_ID_BY_NAME[permission.module]?.[permission.name];

			return {
				permissionId,
				userId: filter.userId,
				teamId: filter.teamId,
				creatorId: filter.loggedUserId
			};
		});
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

	async create(data) {
		const transaction = await this.database.masterInstance.transaction();

		try {
			let user = await User.findOne({
				where: {
					email: data.email,
					is_deleted: false
				}
			});

			// Check if member already exists for this team
			if (user) {
				const existingMember = await Member.findOne({
					where: {
						teamId: data.team_id,
						userId: user.id,
						isDeleted: false
					}
				});

				if (existingMember) {
					throw new ExceptionUtils({
						status: httpStatus.CONFLICT,
						code: 'USER_ALREADY_EXISTS',
						message: 'User is already a member of this team'
					});
				}
			} else {
				// Create new user if doesn't exist
				user = await User.create({
					name: data.name,
					email: data.email,
					password: data.password,
					is_deleted: false,
					activeTeamId: data.team_id
				}, { transaction });
			}

			// Create team membership
			await Member.create({
				teamId: data.team_id,
				userId: user.id,
				isAdmin: false,
				isDeleted: false,
				creatorId: data.logged_user_id
			}, { transaction });

			// Grant default module permissions
			// const memberPermissions = [{
			// 	module: PermissionConstants.PERMISSION_MODULES.DEFAULT,
			// 	name: PermissionConstants.PERMISSIONS.CREATE
			// }, {
			// 	module: PermissionConstants.PERMISSION_MODULES.DEFAULT,
			// 	name: PermissionConstants.PERMISSIONS.READ
			// }, {
			// 	module: PermissionConstants.PERMISSION_MODULES.DEFAULT,
			// 	name: PermissionConstants.PERMISSIONS.UPDATE
			// }, {
			// 	module: PermissionConstants.PERMISSION_MODULES.DEFAULT,
			// 	name: PermissionConstants.PERMISSIONS.DELETE
			// }];

			// const permissionsToCreate = this.mountPermissionsToCreate({
			// 	permissions: memberPermissions,
			// 	filter: {
			// 		userId: user.id,
			// 		teamId: data.team_id,
			// 		loggedUserId: data.logged_user_id
			// 	}
			// });

			// await UserPermission.bulkCreate(permissionsToCreate, { transaction });

			await UserLog.create({
				type: LogConstants.CREATE_USER,
				userId: data.logged_user_id,
				teamId: data.team_id,
				targetUserId: user.id
			}, { transaction });

			await transaction.commit();

			return user;
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
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

		if (data.email && isChangingEmail) {
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

		if (!isChangingPassword) {
			return true;
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
					teamId: meta.teamId,
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
			team: {
				name: user.member.team.name,
				plan_status: user.member.team.subscription.status
			},
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
				include: {
					model: Team,
					attributes: ['name'],
					include: {
						model: Subscription,
						attributes: ['status']
					}
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

	async getPermissions(id, teamId) {
		const user = await User.findOne({
			where: { id },
			attributes: ['id', 'name', 'email']
		});

		if (!user) {
			return {
				permissions: []
			};
		}

		const permissions = await UserPermission.findAll({
			where: {
				userId: id,
				teamId,
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
			userId: id,
			permissions: map(permissions, permission => this.mountUserPermission(permission))
		};
	}
}
