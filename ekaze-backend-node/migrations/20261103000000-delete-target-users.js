'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Disabled - do not purge user accounts
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.resolve();
  }
};
