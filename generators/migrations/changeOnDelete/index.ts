/**
 *
 * ## Change On Delete Migration Generator
 * Change the onDelete status of a foreign key constraint
 *
 * @module changeOnDelete
 * @see module:changeOnDelete/prompts
 */

// commons
const cases = require('@commons/cases');

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({
    modelTableName,
    modelContainer,
    model,
    columnName,
    newOnDelete,
    oldOnDelete,
  }) => ({
    name: `change-on-delete-${modelTableName}-${columnName}-to-${cases.paramCase(
      newOnDelete,
    )}`,
    comment: `Change the foreign key constraint for column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} from ${oldOnDelete} to ${newOnDelete}`,
  }),
  description: 'Change the onDelete status of a foreign key constraint',
  prompts,
  type: 'tableColumnMigration',
};
