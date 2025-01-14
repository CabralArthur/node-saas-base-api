'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('user_logs', 'target_user_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
            model: 'users',
            key: 'id'
        }
    });
  },
  async down (queryInterface) {
    await queryInterface.removeColumn('user_logs', 'target_user_id');
  }
};
