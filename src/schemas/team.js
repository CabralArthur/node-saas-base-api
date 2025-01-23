import * as yup from 'yup';

export default {
	update: {
		body: yup.object().shape({
			name: yup.string(),
			description: yup.string()
		})
	},
	switchTeam: {
		params: yup.object().shape({
			id: yup.number().required()
		})
	}
};
