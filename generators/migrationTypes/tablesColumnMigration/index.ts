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
const prompts = require('./prompts');

module.exports = {
  parentType: 'tablesMigration',
  prompts,
};
