'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();

		try {
			await queryInterface.createTable('permission_modules', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				name: {
					type: Sequelize.STRING,
					allowNull: false
				},
				key: {
					type: Sequelize.STRING,
					allowNull: false
				},
				is_deleted: {
					type: Sequelize.BOOLEAN,
					defaultValue: false
				}
			}, { transaction });

			await queryInterface.createTable('permissions', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				name: {
					type: Sequelize.STRING,
					allowNull: false
				},
				key: {
					type: Sequelize.STRING,
					allowNull: false
				},
				permission_module_id: {
					type: Sequelize.INTEGER,
					references: {
						model: 'permission_modules',
						key: 'id'
					},
					allowNull: false
				},
				is_deleted: {
					type: Sequelize.BOOLEAN,
					defaultValue: false
				}
			}, { transaction });

			await queryInterface.createTable('user_permissions', {
				id: {
					type: Sequelize.INTEGER,
					primaryKey: true,
					autoIncrement: true
				},
				permission_id: {
					type: Sequelize.INTEGER,
					references: {
						model: 'permissions',
						key: 'id'
					},
					allowNull: false
				},
				user_id: {
					type: Sequelize.INTEGER,
					references: {
						model: 'users',
						key: 'id'
					},
					allowNull: false
				},
				team_id: {
					type: Sequelize.INTEGER,
					references: {
						model: 'teams',
						key: 'id'
					},
					allowNull: false
				},
				creator_id: {
					type: Sequelize.INTEGER,
					references: {
						model: 'users',
						key: 'id'
					},
					allowNull: false
				},
				is_deleted: {
					type: Sequelize.BOOLEAN,
					defaultValue: false
				},
				created_at: {
					type: Sequelize.DATE,
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
				},
				updated_at: {
					type: Sequelize.DATE,
					defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
				}
			}, { transaction });

			await queryInterface.addIndex('user_permissions', ['user_id', 'team_id', 'is_deleted'], { transaction });

			await queryInterface.sequelize.query(`
				INSERT INTO permission_modules(id, name, key)
				VALUES
				(DEFAULT, 'Tasks', 'TASKS'),
			`, { transaction });

			await queryInterface.sequelize.query(`
				INSERT INTO permissions(id, name, key, permission_module_id)
				VALUES
				-- Fornecedores
				(DEFAULT, 'View', 'READ', 1),
				(DEFAULT, 'Create', 'CREATE', 1),
				(DEFAULT, 'Edit', 'UPDATE', 1),
				(DEFAULT, 'Remove', 'DELETE', 1),
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
			await queryInterface.dropTable('user_permissions', { transaction });
			await queryInterface.dropTable('permissions', { transaction });
			await queryInterface.dropTable('permission_modules', { transaction });

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();

			throw error;
		}
	}
};
