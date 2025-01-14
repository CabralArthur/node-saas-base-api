import { sanitizeValue } from './utils';
import * as yup from 'yup';

export default {
	login: {
		body: yup.object().shape({
			email: yup.string().transform(sanitizeValue).email().required(),
			password: yup.string().transform(sanitizeValue).required()
		})
	}
};
