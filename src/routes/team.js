import BaseRoutes from './base';
import { TeamSchema } from '@schemas';
import { TeamController } from '@controllers';
import { AdminUserMiddleware } from '@middlewares';

class TeamRoutes extends BaseRoutes {
	constructor() {
		super();
		this.teamController = new TeamController();
	}

	setup() {
		this.router.get('/user-teams', this.teamController.listUserTeams);

		this.router.post('/switch/:id',
			this.SchemaValidator.validate(TeamSchema.switchTeam),
			this.teamController.switchTeam
		);

		// Team management operations
		this.router.get('/',
			AdminUserMiddleware.isAuthorized,
			this.teamController.find
		);

		this.router.put('/',
			AdminUserMiddleware.isAuthorized,
			this.SchemaValidator.validate(TeamSchema.update),
			this.teamController.update
		);

		return this.router;
	}
}

export default TeamRoutes;
