/**
 * Make a column non null
 */
export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `make-column-non-null-${modelTableName}-${columnName}`,
    comment: `Make the column ${model}.${columnName} non null.`,
  }),
  description: 'Make a column non null',
  // columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
