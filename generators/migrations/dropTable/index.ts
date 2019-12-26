// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Drop one of the tables
 */
export default {
  configure: ({ modelTableName, modelContainer, model }) => ({
    name: `drop-table-${modelTableName}`,
    comment: `Drop the ${linkToClass(modelContainer, model)} table.`,
  }),
  description: 'Drop one of the tables',
  suggestOnly: true,
  type: 'tableColumnsMigration',
};
