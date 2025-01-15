import dayjs from 'dayjs';
import { Subscription } from '@models';
import { ExceptionUtils } from '@utils';
import { TRIAL_DAYS } from '@constants/subscription';
import httpStatus from 'http-status';

export const validateSubscription = async (req, res, next) => {
	try {
		const { teamId } = req.user;

		const subscription = await Subscription.findOne({
			where: {
				teamId,
				status: ['TRIAL', 'ACTIVE']
			},
			order: [['createdAt', 'DESC']]
		});

		if (subscription?.status === 'TRIAL') {
			const trialExpired = dayjs.isAfter(dayjs(subscription.createdAt).add(TRIAL_DAYS, 'days'));

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
};
