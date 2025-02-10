"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the existing column 'expiresAt' to 'expires_at' in the 'tokens' table
    await queryInterface.renameColumn("tokens", "expiresAt", "expires_at");
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column name from 'expires_at' back to 'expiresAt' if needed
    await queryInterface.renameColumn("tokens", "expires_at", "expiresAt");
  },
};
