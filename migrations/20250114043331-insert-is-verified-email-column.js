'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'is_email_verified', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    });
  },
  async down (queryInterface) {
    await queryInterface.removeColumn('users', 'is_email_verified');
  }
};
