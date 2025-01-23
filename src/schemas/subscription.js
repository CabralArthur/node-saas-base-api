import * as yup from 'yup';

export default {
	checkout: {
		body: yup.object().shape({
			planModel: yup.string().oneOf(['MONTHLY', 'YEARLY']).required()
		})
	}
};

