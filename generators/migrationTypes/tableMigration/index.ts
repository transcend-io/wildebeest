/**
 *
 * ## Table Migration Generator
 * Create a migration that modifies a single table
 *
 * @module tableMigration
 * @see module:tableMigration/prompts
 */

// local
import prompts from './prompts';

module.exports = {
  parentType: 'dbMigration',
  prompts,
};
