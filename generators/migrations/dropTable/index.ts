/**
 *
 * ## Drop Table Migration Generator
 * Drop one of the tables
 *
 * @module dropTable
 */

// global
import linkToClass from '@generators/utils/linkToClass';

export default {
  configure: ({ modelTableName, modelContainer, model }) => ({
    name: `drop-table-${modelTableName}`,
    comment: `Drop the ${linkToClass(modelContainer, model)} table.`,
  }),
  description: 'Drop one of the tables',
  suggestOnly: true,
  type: 'tableColumnsMigration',
};
