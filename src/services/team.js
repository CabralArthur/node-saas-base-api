import { Team, Plan, Subscription, Payment, Member, User } from '@models';
import { ExceptionUtils, AuthUtils } from '@utils';
import { pick } from 'lodash';
import httpStatus from 'http-status';
import dayjs from 'dayjs';

export default class TeamService {
	async find(filter) {
		const team = await Team.findOne({
			where: {
				id: filter.id,
				is_deleted: false
			},
			include: [{
				model: Subscription,
				required: false,
				attributes: ['status', ['paid_at', 'last_payment_date'], 'endsAt', 'created_at'],
				include: [{
					model: Plan,
					attributes: ['name', 'price', 'trial_days'],
					as: 'plan'
				}, {
					model: Payment,
					attributes: ['status', 'paid_at', 'amount', 'currency', 'stripe_payment_id', 'invoice_link'],
					where: {
						deleted_at: null
					},
					required: false,
					as: 'payments',
					order: [['created_at', 'DESC']]
				}]
			}]
		});

		if (!team) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'NOT_FOUND',
				message: 'Team not found'
			});
		}

		const teamData = team.toJSON();
		const isInTrial = teamData.subscription?.status === 'TRIAL';

		const trialEndsAt = isInTrial ?
			dayjs(teamData.subscription.created_at)
				.add(teamData.subscription.plan.trial_days, 'days')
				.format('DD/MM/YYYY')
			: null;

		const endsAt = teamData.subscription?.endsAt ?
			dayjs(teamData.subscription.endsAt).format('DD/MM/YYYY')
			: null;

		return {
			...teamData,
			subscription: teamData.subscription ? {
				...teamData.subscription,
				ends_at: isInTrial ? trialEndsAt : endsAt
			} : null
		};
	}

	async switchTeam(userId, teamId) {
		const member = await Member.findOne({
			where: {
				userId,
				teamId
			}
		});

		if (!member) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'NOT_FOUND',
				message: 'Member not found'
			});
		}

		const updatedUser = await User.update({
			activeTeamId: teamId
		}, {
			where: {
				id: userId
			},
            raw: true,
			returning: true
		});


		return AuthUtils.getTokenData(pick({
			...updatedUser?.[1]?.[0],
			teamId,
			isAdmin: member.isAdmin
		}, ['id', 'name', 'email', 'isAdmin', 'teamId']));
	}

	async listUserTeams(userId) {
		const members = await Member.findAll({
			where: {
				userId,
				isDeleted: false
			},
			include: [{
				model: User,
				where: {
					isDeleted: false,
					id: userId
				},
				attributes: ['id', 'name', 'activeTeamId']
			}],
			nest: true,
			attributes: ['userId', 'teamId'],
			raw: true
		});

		const teams = await Team.findAll({
			where: {
				id: members.map(member => member.teamId)
			},
			attributes: ['id', 'name']
		});

		const activeTeamId = members.find(member => member.userId === userId)?.user?.activeTeamId;

		return teams.map(team => ({
			...team.toJSON(),
			is_active: team.id === activeTeamId
		}));
	}

	async update(filter, data) {
		const team = await Team.findOne({
			where: {
				id: filter.id,
				is_deleted: false
			}
		});

		if (!team) {
			throw new ExceptionUtils({
				status: httpStatus.NOT_FOUND,
				code: 'NOT_FOUND',
				message: 'Team not found'
			});
		}

		await team.update(data);

		return this.find({ id: team.id });
	}
}
