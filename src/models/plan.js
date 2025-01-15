import BaseModel from './base';

export default class Plan extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				allowNull: false
			},
			price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false
			},
			trial_days: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				defaultValue: true
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'plan',
			tableName: 'plans',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		});
	}
}
