/**
 *
 * ## Rename Index Migration Generator
 * Rename an index
 *
 * @module renameIndex
 */

// local
import * as prompts from './prompts';

export default {
  configure: ({ oldName, newName }) => ({
    name: `rename-index-to-${newName}`,
    comment: `Rename the index ${oldName} to ${newName}.`,
  }),
  description: 'Rename an index',
  prompts,
  type: 'dbMigration',
};
