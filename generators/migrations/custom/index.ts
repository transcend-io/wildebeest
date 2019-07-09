/**
 *
 * ## Custom Generator
 * A custom migration
 *
 * @module custom
 * @see module:custom/prompts
 */

// local
import prompts from './prompts';

module.exports = {
  configure: ({ modelTableName, name }) => ({
    name: `${modelTableName}-${name}`,
  }),
  description: 'A custom migration',
  prompts,
  type: 'tableMigration',
};
