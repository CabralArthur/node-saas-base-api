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

	static isValidPasswordStrength(password = '') {
		const hasNumber = /\d/.test(password);
		const hasMinLength = password.length >= 8;
		const hasUppercaseLetter = /[A-Z]/.test(password);
		const hasSpecialChar = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password);
		const hasPrerequisites = hasNumber && hasMinLength && hasSpecialChar && hasUppercaseLetter;

		return hasPrerequisites;
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
