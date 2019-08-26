/**
 *
 * ## TableColumnMigration Migration Type
 * A higher order generator that creates a Table column migration migrator.
 *
 * Migrate a table column
 *
 * @module tableColumnMigration
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'tableMigration',
  prompts,
};
