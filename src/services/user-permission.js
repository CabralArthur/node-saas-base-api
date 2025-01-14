import httpStatus from 'http-status';

import Database from '@database';
import { ExceptionUtils } from '@utils';
import { UserService } from '@services';
import { LogConstants } from '@constants';
import { UserLog, UserPermission } from '@models';
import { MODULE_ID_BY_NAME, PERMISSION_MODULE_ID_BY_NAME, PERMISSIONS } from '../constants/permission';

export default class UserPermissionService {
	constructor() {
		this.database = new Database();
		this.userService = new UserService();
	}

	mountActivePermissionsByModule(permissions) {
		return permissions.reduce((acc, permission) => {
			const permissionModuleId = MODULE_ID_BY_NAME[permission.module];
			const permissionId = PERMISSION_MODULE_ID_BY_NAME[permission.module]?.[permission.name];

			if (!permissionId || !permissionModuleId) {
				return acc;
			}

			if (!acc[permission.module]) {
				acc[permission.module] = {};
			}

			acc[permission.module][permission.name] = true;

			return acc;
		}, {

		});
	}

	checkPermissionsIsValid(permissions) {
		const activePermissionsByModule = this.mountActivePermissionsByModule(permissions);

		const hasInvalidPermission = permissions.some(permission => {
			const permissionModuleId = MODULE_ID_BY_NAME[permission.module];
			const permissionId = PERMISSION_MODULE_ID_BY_NAME[permission.module]?.[permission.name];

			if (!permissionId || !permissionModuleId) {
				return true;
			}

			const hasReadPermission = activePermissionsByModule[permission.module]?.[PERMISSIONS.READ];

			if (permission.name !== PERMISSIONS.READ && !hasReadPermission) {
				return true;
			}

			return false;
		});

		if (hasInvalidPermission) {
			throw new ExceptionUtils({
				status: httpStatus.BAD_REQUEST,
				code: 'INVALID_PERMISSION',
				message: 'Invalid user permissions.'
			});
		}

		return true;
	}

	mountPermissionsToCreate({ permissions, filter }) {
		return permissions.map(permission => {
			const permissionId = PERMISSION_MODULE_ID_BY_NAME[permission.module]?.[permission.name];

			return {
				permissionId,
				userId: filter.userId,
				teamId: filter.teamId,
				creatorId: filter.loggedUserId
			};
		});
	}

	async validateUserToEdit({ id, meta }) {
		await this.userService.find({ id, teamId: meta.teamId });

		return true;
	}

	async update({ id, data, meta }) {
		await this.validateUserToEdit({ id, meta });

		this.checkPermissionsIsValid(data.permissions);

		const transaction = await this.database.masterInstance.transaction();

		try {
			await UserPermission.update({
				isDeleted: true
			}, {
				where: {
					userId: id,
					isDeleted: false,
					teamId: meta.teamId
				},
				transaction
			});

			const permissionsToCreate = this.mountPermissionsToCreate({
				permissions: data.permissions,
				filter: {
					userId: id,
					teamId: meta.teamId,
					loggedUserId: meta.loggedUserId
				}
			});

			await UserPermission.bulkCreate(permissionsToCreate, { transaction });

			await UserLog.create({
				type: LogConstants.UPDATE_USER_PERMISSIONS,
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
}
