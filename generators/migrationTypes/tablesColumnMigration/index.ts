/**
 *
 * ## TablesColumnMigration Migration Type
 * A higher order generator that creates a Tables column migration migrator.
 *
 * Migrate the same column on multiple tables
 *
 * @module tablesColumnMigration
 * @see module:tablesColumnMigration/prompts
 */

// local
import prompts from './prompts';

module.exports = {
  parentType: 'tablesMigration',
  prompts,
};
