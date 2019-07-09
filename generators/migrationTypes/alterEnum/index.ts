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
const prompts = require('./prompts');

module.exports = {
  parentType: 'tableMigration',
  prompts,
};
