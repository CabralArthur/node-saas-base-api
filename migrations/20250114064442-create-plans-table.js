'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('plans', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			price: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: false
			},
			trial_days: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
				allowNull: false
			},
			is_active: {
				type: Sequelize.BOOLEAN,
				defaultValue: true
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

		// Add index on name for faster lookups
		await queryInterface.addIndex('plans', ['name']);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('plans');
	}
};
