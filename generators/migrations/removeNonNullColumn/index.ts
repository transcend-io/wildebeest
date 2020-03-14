/**
 * Remove a column that is not allowed to be null, and when down is run, allow the column to be null
 */
export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `remove-non-null-column-${modelTableName}-${columnName}`,
    comment: `Remove non null column ${model}.${columnName}.`,
  }),
  description:
    'Remove a column that is not allowed to be null, and when down is run, allow the column to be null',
  type: 'tableColumnMigration',
};
