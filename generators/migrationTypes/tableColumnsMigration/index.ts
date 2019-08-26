/**
 *
 * ## TableColumnsMigration Migration Type
 * A higher order generator that creates a Table columns migration migrator.
 *
 * Create a migration that modifies multiple columns in a table
 *
 * @module tableColumnsMigration
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'tableMigration',
  prompts,
};
