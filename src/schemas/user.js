import { sanitizeValue } from './utils';
import * as yup from 'yup';

export default {
	create: {
		body: yup.object().shape({
			name: yup.string().transform(sanitizeValue).required(),
			email: yup.string().transform(sanitizeValue).email().required(),
			password: yup.string().transform(sanitizeValue).required()
		})
	},
	find: {
		params: yup.object().shape({
			id: yup.string().transform(sanitizeValue).required()
		})
	},
	update: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		}),
		body: yup.object().shape({
			name: yup.string().transform(sanitizeValue).nullable(),
			email: yup.string().transform(sanitizeValue).email().nullable(),
			oldPassword: yup.string().transform(sanitizeValue).nullable(),
			newPassword: yup.string().transform(sanitizeValue).nullable(),
			confirmNewPassword: yup.string().transform(sanitizeValue).oneOf([yup.ref('newPassword'), null], 'Passwords must match').when('newPassword', {
				is: password => !!password,
				then: yup.string().required('Confirm new password is required when new password is provided'),
				otherwise: yup.string().nullable()
			})
		})
	},
	updatePermissions: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		}),
		body: yup.object().shape({
			permissions: yup.array().of(yup.object({
				module: yup.string().required(),
				name: yup.string().required()
			})).required()
		})
	},
	delete: {
		params: yup.object().shape({
			id: yup.number().positive().required()
		})
	}
};
