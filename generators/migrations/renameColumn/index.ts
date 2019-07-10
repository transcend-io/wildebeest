/**
 *
 * ## Rename Column Migration Generator
 * Create a migration definition that renames a column
 *
 * @module renameColumn
 * @see module:renameColumn/prompts
 */

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import * as prompts from './prompts';

export default {
  configure: ({ modelTableName, newName, oldName, modelContainer, model }) => ({
    name: `rename-column-${modelTableName}-to-${newName}`,
    comment: `Rename the column ${oldName} to ${newName} on table ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Create a migration definition that renames a column',
  prompts,
  type: 'tableMigration',
};
