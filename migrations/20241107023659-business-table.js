'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();

		try {
			await queryInterface.createTable('teams', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true,
					allowNull: false
				},
				name: {
					type: Sequelize.STRING,
					allowNull: true
				},
				description: {
					type: Sequelize.TEXT,
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
				},
				is_deleted: {
					type: Sequelize.BOOLEAN,
					allowNull: false,
					defaultValue: false
				}
			}, { transaction });
			
			await queryInterface.sequelize.query(`
				INSERT INTO teams(id, name, description, created_at, updated_at, is_deleted)
				VALUES
				(DEFAULT, 'Empresa Beta', DEFAULT, DEFAULT, DEFAULT, DEFAULT);
			`, { transaction });

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	},
	down: async queryInterface => {
		const transaction = await queryInterface.sequelize.transaction();

		try {
			await queryInterface.dropTable('teams', { transaction });

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			throw error;
		}
	}
};
