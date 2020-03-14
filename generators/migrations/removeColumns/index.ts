/**
 * Remove multiple columns on up, and add them back on down
 */
export default {
  configure: ({ modelTableName, columns, model }) => ({
    name: `remove-columns-${modelTableName}-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Remove columns (${columns
      .map(({ columnName }) => columnName)
      .join(', ')}) to ${model}.`, // eslint-disable-line max-len
  }),
  description: 'Remove multiple columns on up, and add them back on down',
  columnSuggestOnly: true,
  withGetRowDefaults: true,
  type: 'tableColumnsMigration',
};
