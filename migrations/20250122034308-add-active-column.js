'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('users', 'active_team_id', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: {
				model: 'teams',
				key: 'id'
			}
		});
	},
	async down(queryInterface) {
		await queryInterface.removeColumn('users', 'active_team_id');
	}
};
