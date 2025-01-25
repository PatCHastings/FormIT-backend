module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("wizard_steps", "service_type", {
      type: Sequelize.STRING,
      allowNull: false, // Keeps the column required
      defaultValue: null, // Removes the default value
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("wizard_steps", "service_type", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "general", // Re-add the default if rolling back
    });
  },
};