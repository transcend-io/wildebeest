/**
 *
 * ## AlterEnum Migration Type
 * A higher order generator that creates a Alter enum migrator.
 *
 * Alter an existing enum
 *
 * @module alterEnum
 * @see module:alterEnum/prompts
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'tableMigration',
  prompts,
};
