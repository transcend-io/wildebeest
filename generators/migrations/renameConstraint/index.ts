/**
 *
 * ## Rename Constraint Migration Generator
 * Rename a table column constraint
 *
 * @module renameConstraint
 * @see module:renameConstraint/prompts
 */

// commons
const cases = require('@commons/cases');

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({ modelContainer, model, columnName, newName, oldName }) => ({
    name: `rename-constraint-${cases.paramCase(newName)}`,
    comment: `Rename the constraint ${oldName} for ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} to ${newName}.`,
  }),
  description: 'Rename a table column constraint',
  prompts,
  type: 'tableColumnMigration',
};
