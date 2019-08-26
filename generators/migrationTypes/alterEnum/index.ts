/**
 *
 * ## AlterEnum Migration Type
 * A higher order generator that creates a Alter enum migrator.
 *
 * Alter an existing enum
 *
 * @module alterEnum
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'tableMigration',
  prompts,
};
