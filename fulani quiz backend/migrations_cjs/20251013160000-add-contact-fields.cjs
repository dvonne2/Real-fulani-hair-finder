"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('quiz_results', 'name', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('quiz_results', 'email', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('quiz_results', 'phone', { type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('quiz_results', 'state', { type: Sequelize.STRING, allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('quiz_results', 'state');
    await queryInterface.removeColumn('quiz_results', 'phone');
    await queryInterface.removeColumn('quiz_results', 'email');
    await queryInterface.removeColumn('quiz_results', 'name');
  },
};
