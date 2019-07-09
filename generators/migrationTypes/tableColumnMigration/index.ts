/**
 *
 * ## TableColumnMigration Migration Type
 * A higher order generator that creates a Table column migration migrator.
 *
 * Migrate a table column
 *
 * @module tableColumnMigration
 * @see module:tableColumnMigration/lib
 * @see module:tableColumnMigration/prompts
 * @see module:tableColumnMigration/regexs
 * @see module:tableColumnMigration/typeDefs
 */

// local
const prompts = require('./prompts');

module.exports = {
  parentType: 'tableMigration',
  prompts,
};
