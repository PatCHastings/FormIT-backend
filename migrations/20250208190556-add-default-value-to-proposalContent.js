'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('proposals', 'proposal_content', {
      type: Sequelize.TEXT,
      allowNull: false, // Ensure this matches your model definition
      defaultValue: 'Proposal content not yet generated.', // Add the default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('proposals', 'proposal_content', {
      type: Sequelize.TEXT,
      allowNull: false, // Keep allowNull the same as the original state
      defaultValue: null, // Revert the default value if needed
    });
  },
};
