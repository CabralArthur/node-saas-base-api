import { Business } from '@models';

export default class BusinessService {
	async create({ name, description }) {
		return await Business.create({ name, description });
	}
}
