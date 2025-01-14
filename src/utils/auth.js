import { verify, sign } from 'jsonwebtoken';

export default class AuthUtils {
	static decodeData(token, key) {
		try {
			return verify(token, key);
		} catch (err) {
			return null;
		}
	}

	static getBearerToken(req) {
		const authorization = (req.headers.authorization || '');
		const [, token] = authorization.split(' ');

		return token;
	}

	static getTokenData(user) {
		const dayInMilisseconds = 86400000;
		const expires = Date.now() + dayInMilisseconds;
		const token = sign({
			iss: user.id,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				teamId: user.teamId
			}
		}, process.env.APP_SECRET_KEY);

		return {
			token: token,
			expires: expires
		};
	}
}
