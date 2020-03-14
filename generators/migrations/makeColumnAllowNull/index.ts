/**
 * Make a column allow null values
 */
export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `make-column-allow-null-${modelTableName}-${columnName}`,
    comment: `Make the column ${model}.${columnName} allow null values.`,
  }),
  description: 'Make a column allow null values',
  // columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
