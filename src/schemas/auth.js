import { sanitizeValue } from './utils';
import * as yup from 'yup';

export default {
	login: {
		body: yup.object().shape({
			email: yup.string().transform(sanitizeValue).email().required(),
			password: yup.string().transform(sanitizeValue).required()
		})
	},
	register: {
		body: yup.object().shape({
			name: yup.string().transform(sanitizeValue).required(),
			email: yup.string().transform(sanitizeValue).email().required(),
			password: yup.string().transform(sanitizeValue).required()
		})
	},
	verifyEmail: {
		query: yup.object().shape({
			token: yup.string().transform(sanitizeValue).required()
		})
	},
	requestResetPassword: {
		body: yup.object({
			email: yup.string().email().transform(sanitizeValue).max(255).required()
		}).noUnknown()
	},
};
