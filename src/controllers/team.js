import { TeamService } from '@services';
import BaseController from './base';

export default class TeamController extends BaseController {
	constructor() {
		super();
		this.teamService = new TeamService();

		this.find = this.find.bind(this);
		this.update = this.update.bind(this);
		this.switchTeam = this.switchTeam.bind(this);
		this.listUserTeams = this.listUserTeams.bind(this);
	}

	async listUserTeams(req, res) {
		try {
			const teams = await this.teamService.listUserTeams(req.auth.id);

			this.sendSuccess({ data: teams, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async switchTeam(req, res) {
		try {
			const team = await this.teamService.switchTeam(req.auth.id, req.params.id);

			this.sendSuccess({ data: team, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async find(req, res) {
		try {
			const team = await this.teamService.find({
				id: req.auth.teamId
			});

			this.sendSuccess({ data: team, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}

	async update(req, res) {
		try {
			const team = await this.teamService.update({
				id: req.auth.teamId
			}, {
				...req.data,
				updater_id: req.auth.id
			});

			this.sendSuccess({ data: team, res });
		} catch (error) {
			this.sendError({ error, res });
		}
	}
}
