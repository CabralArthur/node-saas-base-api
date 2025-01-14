import BaseModel from './base';
import { hashSync } from 'bcrypt';

export default class User extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false
			},
			isDeleted: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				field: 'is_deleted'
			}
		}, {
			paranoid: false,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'user',
			tableName: 'users',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			hooks: {
				beforeCreate: user => {
					user.password = hashSync(user.password, 8);
				}
			}
		});
	}

	static associate(models) {
		this.hasOne(models.member, {
			foreignKey: 'user_id'
		});

		this.hasMany(models.user_permission, {
			foreignKey: 'user_id',
			as: 'permissions'
		});
	}
}
