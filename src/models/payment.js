import BaseModel from './base';

export default class Payment extends BaseModel {
	static load(sequelize, DataTypes) {
		return super.init({
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true
			},
			subscription_id: {
				type: DataTypes.INTEGER,
				allowNull: false
			},
			amount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'BRL'
			},
			status: {
				type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
				allowNull: false,
				defaultValue: 'PENDING'
			},
			invoice_link: {
				type: DataTypes.STRING,
				allowNull: true
			},
			payment_method: {
				type: DataTypes.STRING,
				allowNull: false
			},
			stripe_payment_id: {
				type: DataTypes.STRING,
				allowNull: true
			},
			paid_at: {
				type: DataTypes.DATE,
				allowNull: true
			}
		}, {
			paranoid: true,
			timestamps: true,
			underscored: true,
			sequelize: sequelize,
			modelName: 'payment',
			tableName: 'payments',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			deletedAt: 'deleted_at'
		});
	}

	static associate(models) {
		this.belongsTo(models.subscription, { foreignKey: 'subscription_id' });
	}
}
