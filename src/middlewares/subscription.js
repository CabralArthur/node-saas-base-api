import dayjs from 'dayjs';
import { Subscription } from '@models';
import { ExceptionUtils } from '@utils';
import { TRIAL_DAYS } from '@constants/subscription';
import httpStatus from 'http-status';

export default class SubscriptionMiddleware {
	static async validateSubscription(req, res, next) {
		try {
			const { teamId } = req.auth;

			const subscription = await Subscription.findOne({
				where: {
					team_id: teamId,
					status: ['TRIAL', 'ACTIVE'],
				},
                raw: true,
				order: [['created_at', 'DESC']]
			});

			if (subscription?.status === 'TRIAL') {
				const trialExpired = dayjs().isAfter(dayjs(subscription.created_at).add(TRIAL_DAYS, 'days'));

				if (trialExpired) {
					throw new ExceptionUtils({
						status: httpStatus.PAYMENT_REQUIRED,
						code: 'TRIAL_EXPIRED',
						message: 'Trial period has expired'
					});
				}
			}

			if (!subscription) {
				throw new ExceptionUtils({
					status: httpStatus.PAYMENT_REQUIRED,
					code: 'SUBSCRIPTION_REQUIRED',
					message: 'Active subscription required'
				});
			}

			req.subscription = subscription;
			next();
		} catch (error) {
			next(error);
		}
	}
}
