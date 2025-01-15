import dayjs from 'dayjs';
import { Subscription } from '@models';

export default class WebhookService {
	async handle(event) {
		switch (event.type) {
			case 'customer.subscription.deleted':
			case 'customer.subscription.canceled':
				await Subscription.update({
					status: 'CANCELED'
				}, {
					where: {
						stripeCustomerId: event.data.object.customer
					}
				});
				break;

			case 'checkout.subscription.created':
				await Subscription.update({
					status: 'ACTIVE'
				}, {
					where: {
						stripeCustomerId: event.data.object.customer
					}
				});
				break;

			case 'invoice.payment_failed':
				await Subscription.update({
					status: 'OVERDUE',
				}, {
					where: {
						stripeCustomerId: event.data.object.customer
					}
				});
				break;

			case 'invoice.payment_succeeded':
				await Subscription.update({
					status: 'ACTIVE',
				}, {
					where: {
						stripeCustomerId: event.data.object.customer
					}
				});
				break;

			case 'customer.subscription.updated':
				if (event.data.object.cancel_at_period_end) {
					await Subscription.update({
						status: 'CANCELED',
						canceledAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
					}, {
						where: {
							stripeCustomerId: event.data.object.customer
						}
					});
				}
				break;

			default:
				break;
		}

		return true;
	}
}

