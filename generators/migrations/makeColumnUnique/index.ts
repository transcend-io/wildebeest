/**
 * Make a table column unique
 */
export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `make-column-unique-${modelTableName}-${columnName}`,
    comment: `Add a constraint to make ${model}.${columnName} unique.`,
  }),
  description: 'Make a table column unique',
  columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
