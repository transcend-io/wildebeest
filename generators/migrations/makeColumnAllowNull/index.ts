/**
 *
 * ## Make Column Allow Null Migration Generator
 * Make a column allow null values
 *
 * @module makeColumnAllowNull
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

module.exports = {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `make-column-allow-null-${modelTableName}-${columnName}`,
    comment: `Make the column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} allow null values.`,
  }),
  description: 'Make a column allow null values',
  // columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
