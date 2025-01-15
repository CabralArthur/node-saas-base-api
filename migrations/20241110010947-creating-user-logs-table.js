'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();

		try {
			await queryInterface.createTable('user_logs', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					allowNull: false
				},
				type: {
					type: Sequelize.STRING,
					allowNull: false
				},
				user_id: {
					type: Sequelize.INTEGER,
					allowNull: false,
					references: {
						model: 'users',
						key: 'id'
					}
				},
				team_id: {
					type: Sequelize.INTEGER,
					allowNull: false,
					references: {
						model: 'teams',
						key: 'id'
					}
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
			}, { transaction });

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	},
	down: async queryInterface => {
		const transaction = await queryInterface.sequelize.transaction();

		try {
			await queryInterface.dropTable('user_logs', { transaction });

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
};
