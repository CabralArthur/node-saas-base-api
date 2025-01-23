import BaseModel from './base';

export default class Team extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				defaultValue: null,
				allowNull: true
			},
			description: {
				type: DataTypes.TEXT,
				defaultValue: null,
				allowNull: true
			},
			is_deleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: false,
			sequelize: sequelize,
			modelName: 'team',
			tableName: 'teams',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
		});
	}

	static associate(models) {
		this.hasMany(models.member, { foreignKey: 'team_id' });
		this.hasOne(models.subscription, { foreignKey: 'team_id' });
	}
}
