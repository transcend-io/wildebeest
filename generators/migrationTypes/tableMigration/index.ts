/**
 *
 * ## Table Migration Generator
 * Create a migration that modifies a single table
 *
 * @module tableMigration
 * @see module:tableMigration/prompts
 */

// local
const prompts = require('./prompts');

module.exports = {
  parentType: 'dbMigration',
  prompts,
};
