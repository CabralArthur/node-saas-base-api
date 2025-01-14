'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('subscriptions', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onDelete: 'CASCADE'
			},
			team_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'teams',
					key: 'id'
				},
				onDelete: 'CASCADE'
			},
			plan_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'plans',
					key: 'id'
				},
				onDelete: 'RESTRICT'
			},
			paid_at: {
				type: Sequelize.DATE,
				allowNull: true
			},
			canceled_at: {
				type: Sequelize.DATE,
				allowNull: true
			},
			expired_at: {
				type: Sequelize.DATE,
				allowNull: true
			},
			status: {
				type: Sequelize.STRING,
				defaultValue: 'TRIAL'
			},
			stripe_subscription_id: {
				type: Sequelize.STRING,
				allowNull: true
			},
			stripe_customer_id: {
				type: Sequelize.STRING,
				allowNull: true
			},
			stripe_price_id: {
				type: Sequelize.STRING,
				allowNull: true
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
			}
		});

		// Add indexes for better query performance
		await queryInterface.addIndex('subscriptions', ['user_id']);
		await queryInterface.addIndex('subscriptions', ['team_id']);
		await queryInterface.addIndex('subscriptions', ['plan_id']);
		await queryInterface.addIndex('subscriptions', ['stripe_subscription_id']);
		await queryInterface.addIndex('subscriptions', ['stripe_customer_id']);
		await queryInterface.addIndex('subscriptions', ['status']);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('subscriptions');
	}
};
