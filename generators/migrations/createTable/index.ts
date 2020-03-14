/**
 * Create a new db table
 */
export default {
  configure: ({ modelTableName, model }) => ({
    name: `create-table-${modelTableName}`,
    comment: `Create the ${model} table.`,
  }),
  description: 'Create a new db table',
  type: 'tableColumnsMigration',
};
