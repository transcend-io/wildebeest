/**
 *
 * ## Custom Generator
 * A custom migration
 *
 * @module custom
 */

// local
import * as prompts from './prompts';

export default {
  configure: ({ modelTableName, name }) => ({
    name: `${modelTableName}-${name}`,
  }),
  description: 'A custom migration',
  prompts,
  type: 'tableMigration',
};
