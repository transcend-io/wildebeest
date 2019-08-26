/**
 *
 * ## TablesMigration Migration Type
 * A higher order generator that creates a Tables migration migrator.
 *
 * Migrate multiple tables at the same time
 *
 * @module tablesMigration
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'dbMigration',
  prompts,
};
