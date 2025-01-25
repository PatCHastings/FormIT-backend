module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tokens", "full_name", {
      type: Sequelize.STRING,
      allowNull: true, // Temporarily stored, not critical
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("tokens", "full_name");
  },
};