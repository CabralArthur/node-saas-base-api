import BaseModel from './base';

export default class Subscription extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			teamId: {
				field: 'team_id',
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			planId: {
				field: 'plan_id',
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			paidAt: {
				field: 'paid_at',
				type: DataTypes.DATE,
				allowNull: true
			},
			canceledAt: {
				field: 'canceled_at',
				type: DataTypes.DATE,
				allowNull: true
			},
			createdAt: {
				field: 'created_at',
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			},
			endsAt: {
				field: 'ends_at',
				type: DataTypes.DATE,
				allowNull: true
			},
			updatedAt: {
				field: 'updated_at',
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: 'TRIAL'
			},
			stripeSubscriptionId: {
				field: 'stripe_subscription_id',
				type: DataTypes.STRING,
				allowNull: true
			},
			stripeCustomerId: {
				field: 'stripe_customer_id',
				type: DataTypes.STRING,
				allowNull: true
			},
			stripePriceId: {
				field: 'stripe_price_id',
				type: DataTypes.STRING,
				allowNull: true
			},
			userId: {
				field: 'user_id',
				type: DataTypes.INTEGER,
				allowNull: false,
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'subscription',
			tableName: 'subscriptions',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			indexes: [
				{ fields: ['userId'] },
				{ fields: ['teamId'] },
				{ fields: ['planId'] },
				{ fields: ['stripeSubscriptionId'] },
				{ fields: ['stripeCustomerId'] },
				{ fields: ['status'] }
			]
		});
	}
}
