/**
 *
 * ## TablesMigration Migration Type
 * A higher order generator that creates a Tables migration migrator.
 *
 * Migrate multiple tables at the same time
 *
 * @module tablesMigration
 * @see module:tablesMigration/prompts
 * @see module:tablesMigration/regexs
 */

// local
const prompts = require('./prompts');

module.exports = {
  parentType: 'dbMigration',
  prompts,
};
