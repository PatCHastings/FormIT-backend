module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("wizard_steps", "service_type", {
      type: Sequelize.STRING,
      allowNull: false, // Makes the column required
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("wizard_steps", "service_type", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "general", // Re-add the default value when rolling back
    });
  },
};