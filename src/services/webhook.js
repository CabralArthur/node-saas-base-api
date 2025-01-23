import dayjs from 'dayjs';
import config from '../config/config';
import { Subscription, Payment } from '@models';

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

			case 'customer.subscription.created': {
				const subscription = await Subscription.findOne({
					where: {
						stripeCustomerId: event.data.object.customer
					},
					raw: true
				});

				const planId = event.data.object.items.data[0].price.id;
				const updateData = {
					status: 'ACTIVE',
					stripeSubscriptionId: event.data.object.id,
					stripePriceId: planId,
					endsAt: dayjs.unix(event.data.object.current_period_end).format('YYYY-MM-DD HH:mm:ss'),
					paidAt: dayjs.unix(event.data.object.created).format('YYYY-MM-DD HH:mm:ss')
				};

				if (planId === config.stripe.YEARLY) {
					updateData.planId = config.stripe.YEARLY_DB_PLAN_ID;
				} else {
					updateData.planId = config.stripe.MONTHLY_DB_PLAN_ID;
				}

				await Promise.all([
					Subscription.update(updateData, {
						where: { id: subscription.id }
					}),
					Payment.create({
						subscription_id: subscription.id,
						status: 'PAID',
						amount: 0,
						currency: 'EUR',
						payment_method: event.data.object.payment_method_types?.[0] || 'CARD',
						stripe_payment_id: event.data.object.payment_intent,
						paid_at: dayjs().format('YYYY-MM-DD HH:mm:ss')
					})
				]);
				break;
			}

			case 'invoice.payment_failed': {
				const subscription = await Subscription.findOne({
					where: {
						stripeCustomerId: event.data.object.customer
					}
				});

				await Promise.all([
					Subscription.update({
						status: 'OVERDUE'
					}, {
						where: { id: subscription.id }
					}),
					Payment.create({
						subscription_id: subscription.id,
						amount: event.data.object.amount_due / 100,
						currency: event.data.object.currency.toUpperCase(),
						status: 'FAILED',
						payment_method: event.data.object.payment_method_types[0],
						stripe_payment_id: event.data.object.payment_intent
					})
				]);
				break;
			}

			case 'invoice.payment_succeeded': {
				const subscription = await Subscription.findOne({
					where: {
						stripeCustomerId: event.data.object.customer
					},
					raw: true
				});

				const updateData = {
					status: 'ACTIVE',
					stripePriceId: event.data.object.lines.data[0].price.id,
					currency: event.data.object.currency.toUpperCase(),
					paidAt: dayjs.unix(event.data.object.created).format('YYYY-MM-DD HH:mm:ss')
				};

				const latestPayment = await Payment.findOne({
					where: {
						subscription_id: subscription.id,
						deleted_at: null
					},
					order: [['created_at', 'DESC']]
				});

				await Promise.all([
					Subscription.update(updateData, {
						where: { id: subscription.id }
					}),
					Payment.update({
						invoice_link: event.data.object.hosted_invoice_url,
						amount: event.data.object.amount_paid / 100,
						currency: event.data.object.currency.toUpperCase(),
						status: 'PAID',
						stripe_payment_id: event.data.object.payment_intent,
						paid_at: dayjs.unix(event.data.object.created).format('YYYY-MM-DD HH:mm:ss')
					}, {
						where: {
							id: latestPayment.id
						}
					})
				]);
				break;
			}

			case 'customer.subscription.updated': {
				const existentSubscription = await Subscription.findOne({
					where: {
						stripeCustomerId: event.data.object.customer
					}
				});

				if (existentSubscription && event.data.object.cancel_at_period_end) {
					await Subscription.update({
						status: 'CANCELED',
						canceledAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
						endsAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
					}, {
						where: {
							stripeCustomerId: event.data.object.customer
						}
					});
				}

				if (existentSubscription && existentSubscription.canceledAt && !event.data.object.cancel_at_period_end) {
					await Subscription.update({
						status: 'ACTIVE',
						canceledAt: null,
					}, {
						where: { id: existentSubscription.id }
					});
				}
				break;
			}

			default:
				break;
		}

		return true;
	}
}

