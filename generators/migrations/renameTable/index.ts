/**
 *
 * ## Rename Table Migration Generator
 * Rename a table
 *
 * @module renameTable
 */

// local
import * as prompts from './prompts';

export default {
  configure: ({ newName, oldName }) => ({
    name: `rename-table-to-${newName}`,
    comment: `Rename the table ${oldName} to ${newName}.`,
  }),
  description: 'Rename a table',
  prompts,
  type: 'dbMigration',
};
