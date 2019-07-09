/**
 *
 * ## Change Column Migration Generator
 * Change a column definition
 *
 * @module changeColumn
 * @see module:changeColumn/prompts
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({
    columnName,
    // tables,
    modelContainer,
    model,
  }) => ({
    name: `change-column-${columnName}`,
    comment: `Change column "${columnName}" on table ${linkToClass(
      modelContainer,
      model,
    )}`,
    // comment: `Change column ${columnName} on tables ${tables.map(({ modelContainer, model }) => linkToClass(modelContainer, model)).join(', ')}`, // eslint-disable-line max-len
  }),
  description: 'Change a column definition',
  prompts,
  type: 'tableColumnMigration', // TODO 'tablesColumnMigration',
};
