/**
 * Drop one of the tables
 */
export default {
  configure: ({ modelTableName, model }) => ({
    name: `drop-table-${modelTableName}`,
    comment: `Drop the ${model} table.`,
  }),
  description: 'Drop one of the tables',
  suggestOnly: true,
  type: 'tableColumnsMigration',
};
