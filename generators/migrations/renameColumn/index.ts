/**
 *
 * ## Rename Column Migration Generator
 * Create a migration definition that renames a column
 *
 * @module renameColumn
 * @see module:renameColumn/prompts
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
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
