/**
 *
 * ## Make Column Unique Migration Generator
 * Make a table column unique
 *
 * @module makeColumnUnique
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

module.exports = {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `make-column-unique-${modelTableName}-${columnName}`,
    comment: `Add a constraint to make ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} unique.`,
  }),
  description: 'Make a table column unique',
  columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
