'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if 'sort_order' column is not already added
    const tableInfo = await queryInterface.describeTable('categories');

    if (!tableInfo.sort_order) {
      await queryInterface.addColumn('categories', 'sort_order', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove only 'sort_order' column in the rollback
    await queryInterface.removeColumn('categories', 'sort_order');
  },
};
