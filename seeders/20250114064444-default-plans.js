'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface) {
		await queryInterface.bulkInsert('plans', [
			{
				name: 'Default',
				price: 9.00,
				trial_days: 14,
				is_active: true
			}
		]);
	},

	async down(queryInterface) {
		await queryInterface.bulkDelete('plans', null, {});
	}
}; 