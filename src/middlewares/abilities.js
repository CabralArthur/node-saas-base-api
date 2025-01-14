import { ForbiddenError } from '@casl/ability';

import { UserAbilities } from '@abilities';
import { UserService } from '@services';

export default class AbilityMiddleware {
	static getErrorMessageByPermission(permission, module) {
		const permissionMessages = {
			PROVIDERS: {
				READ: 'You are not authorized to view providers.',
				CREATE: 'You are not authorized to create providers.',
				UPDATE: 'You are not authorized to edit providers.',
				DELETE: 'You are not authorized to delete providers.'
			},
			DEVICES: {
				READ: 'You are not authorized to view devices.',
				CREATE: 'You are not authorized to create devices.',
				UPDATE: 'You are not authorized to edit devices.',
				DELETE: 'You are not authorized to delete devices.'
			},
			ASSETS: {
				READ: 'You are not authorized to view assets.',
				CREATE: 'You are not authorized to create assets.',
				UPDATE: 'You are not authorized to edit assets.',
				DELETE: 'You are not authorized to delete assets.'
			},
			DASHBOARD: {
				READ: 'You are not authorized to view the dashboard.'
			}
		};

		return permissionMessages[module]?.[permission] || 'Not authorized.';
	}

	static handleAuthorizationError(res, message) {
		return res.status(403).json({ message });
	}

	static validate(permission, module) {
		return async (req, res, next) => {
			try {
				if (!req.auth.id) {
					return AbilityMiddleware.handleAuthorizationError(res);
				}

				const user = await new UserService().info(req.auth);

				if (!user) {
					return AbilityMiddleware.handleAuthorizationError(res);
				}

				const ability = UserAbilities.forUser(user);

				ForbiddenError.from(ability).throwUnlessCan(permission, module);

				return next();
			} catch (error) {
				return AbilityMiddleware.handleAuthorizationError(res, AbilityMiddleware.getErrorMessageByPermission(permission, module));
			}
		};
	}
}
