/**
 *
 * ## TableColumnsMigration Migration Type
 * A higher order generator that creates a Table columns migration migrator.
 *
 * Create a migration that modifies multiple columns in a table
 *
 * @module tableColumnsMigration
 * @see module:tableColumnsMigration/lib
 * @see module:tableColumnsMigration/prompts
 * @see module:tableColumnsMigration/regexs
 */

// local
import prompts from './prompts';

module.exports = {
  parentType: 'tableMigration',
  prompts,
};
