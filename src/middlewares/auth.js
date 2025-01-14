import { AuthUtils } from '@utils';

export default class AuthMiddleware {
	static isAuthorized(req, res, next) {
		const errorResponse = {
			status: 'error',
			code: 403,
			message: 'Expired session. Please login again.',
		};

		const token = AuthUtils.getBearerToken(req);
		const decodedToken = AuthUtils.decodeData(token, process.env.APP_SECRET_KEY);

		if (!decodedToken || !decodedToken.user || !decodedToken.user.id) {
			res.status(403).json(errorResponse);

			return;
		}

		req.auth = {
			id: decodedToken.user.id,
			isAdmin: decodedToken.user.isAdmin,
			teamId: decodedToken.user.teamId
		};

		next();
	}
}
