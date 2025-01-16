import BaseRoutes from './base';
import { UserSchema } from '@schemas';
import { UserController } from '@controllers';
import { AdminUserMiddleware, HandleUserMiddleware } from '@middlewares';

class UserRoutes extends BaseRoutes {
	constructor() {
		super();

		this.userController = new UserController();
	}

	setup() {
		// User Info Flows
		this.router.get('/info', this.userController.getInfo);

		// User Permission Flows
		this.router.put('/:id/permissions', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.updatePermissions), this.userController.updatePermissions);
		this.router.get('/:id/permissions', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.find), this.userController.getPermissions);

		// User Update / Find FLows
		this.router.get('/', AdminUserMiddleware.isAuthorized, this.userController.list);
		this.router.get('/:id', HandleUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.find), this.userController.find);
		this.router.put('/:id', HandleUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.update), this.userController.update);
		this.router.delete('/:id', AdminUserMiddleware.isAuthorized, this.SchemaValidator.validate(UserSchema.delete), this.userController.delete);

		return this.router;
	}
}

export default UserRoutes;
