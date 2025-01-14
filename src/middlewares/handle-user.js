import { startsWith, includes } from 'lodash';

export default class HandleUserMiddleware {
	static isAuthorized(req, res, next) {
		const errorResponse = {
			status: 'error',
			code: 403,
			message: 'You are not authorized to perform this action',
		};

		const isHandlingUser = startsWith(req.originalUrl, '/user') && includes(['GET', 'PUT', 'DELETE'], req.method);

		if (isHandlingUser && (req.auth.isAdmin || req.auth.id === ~~req.params.id)) {
			next();
			return;
		}

		res.status(403).json(errorResponse);
	}
}
