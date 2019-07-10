/**
 *
 * ## Table Migration Generator
 * Create a migration that modifies a single table
 *
 * @module tableMigration
 * @see module:tableMigration/prompts
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'dbMigration',
  prompts,
};
