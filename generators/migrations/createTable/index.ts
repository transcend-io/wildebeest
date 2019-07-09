/**
 *
 * ## Create Table Migration Generator
 * Create a new db table
 *
 * @module createTable
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
  configure: ({ modelTableName, modelContainer, model }) => ({
    name: `create-table-${modelTableName}`,
    comment: `Create the ${linkToClass(modelContainer, model)} table.`,
  }),
  description: 'Create a new db table',
  type: 'tableColumnsMigration',
};
