import BaseController from './base';
import { UserService, UserPermissionService } from '@services';

class UserController extends BaseController {
	constructor() {
		super();

		this.userService = new UserService();
		this.userPermissionService = new UserPermissionService();

		this.list = this.list.bind(this);
		this.getInfo = this.getInfo.bind(this);
		this.find = this.find.bind(this);
		this.create = this.create.bind(this);
		this.update = this.update.bind(this);
		this.delete = this.delete.bind(this);
		this.updatePermissions = this.updatePermissions.bind(this);
	}

	async create(req, res) {
		try {
			const options = {
				data: req.data,
				meta: {
					loggedUserId: req.auth.id,
					teamId: req.auth.teamId
				}
			};

			const response = await this.userService.create(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async updatePermissions(req, res) {
		try {
			const options = {
				id: req.filter.id,
				data: req.data,
				meta: {
					loggedUserId: req.auth.id,
					teamId: req.auth.teamId
				}
			};

			const response = await this.userPermissionService.update(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async find(req, res) {
		try {
			const response = await this.userService.find({
				id: req.filter.id,
				teamId: req.auth.teamId
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async list(req, res) {
		try {
			const response = await this.userService.list({
				teamId: req.auth.teamId
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async getInfo(req, res) {
		try {
			const response = await this.userService.getInfo({
				id: req.auth.id,
			});

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async update(req, res) {
		try {
			const options = {
				id: req.filter.id,
				data: req.data,
				meta: {
					loggedUserId: req.auth.id,
					teamId: req.auth.teamId
				}
			};

			const response = await this.userService.update(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}

	async delete(req, res) {
		try {
			const options = {
				id: req.filter.id,
				meta: {
					loggedUserId: req.auth.id,
					teamId: req.auth.teamId
				}
			};

			const response = await this.userService.delete(options);

			this.sendSuccess({ data: response, res });
		} catch (error) {
			this.sendError({ error, req, res });
		}
	}
}

export default UserController;
