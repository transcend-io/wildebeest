// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Create a new db table
 */
export default {
  configure: ({ modelTableName, modelContainer, model }) => ({
    name: `create-table-${modelTableName}`,
    comment: `Create the ${linkToClass(modelContainer, model)} table.`,
  }),
  description: 'Create a new db table',
  type: 'tableColumnsMigration',
};
