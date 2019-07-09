/**
 *
 * ## Make Column Non Null Migration Generator
 * Make a column non null
 *
 * @module makeColumnNonNull
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `make-column-non-null-${modelTableName}-${columnName}`,
    comment: `Make the column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} non null.`,
  }),
  description: 'Make a column non null',
  // columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
