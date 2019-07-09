/**
 *
 * ## Change Enum Column Migration Generator
 * Migrate an enum column
 *
 * @module changeEnumColumn
 * @see module:changeEnumColumn/prompts
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({ columnName, modelTableName, modelContainer, model }) => ({
    name: `change-enum-column-${columnName}-${modelTableName}`,
    comment: `Change enum column ${columnName} on table ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Migrate an enum column',
  prompts,
  type: 'tableColumnMigration', // TODO tablesColumnMigration
};
