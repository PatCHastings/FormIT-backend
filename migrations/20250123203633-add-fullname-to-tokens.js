module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tokens', 'fullName', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Tokens', 'fullName');
  },
};