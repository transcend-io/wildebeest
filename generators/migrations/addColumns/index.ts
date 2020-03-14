/**
 * Add columns to a table
 */
export default {
  configure: ({ modelTableName, columns, model }) => ({
    name: `add-columns-${modelTableName}-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Add columns (${columns
      .map(({ columnName }) => columnName)
      .join(', ')}) to ${model}.`, // eslint-disable-line max-len
  }),
  description: 'Add columns to a table',
  withGetRowDefaults: true,
  type: 'tableColumnsMigration',
};
