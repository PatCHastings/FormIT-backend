module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("wizard_steps", "service_type", {
      type: Sequelize.STRING, // e.g. "new_app", "hosting", "cloud", etc.
      allowNull: false,
      defaultValue: "general", // or whatever default you want
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn("wizard_steps", "service_type");
  },
};