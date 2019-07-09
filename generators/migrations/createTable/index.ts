/**
 *
 * ## Create Table Migration Generator
 * Create a new db table
 *
 * @module createTable
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

module.exports = {
  configure: ({ modelTableName, modelContainer, model }) => ({
    name: `create-table-${modelTableName}`,
    comment: `Create the ${linkToClass(modelContainer, model)} table.`,
  }),
  description: 'Create a new db table',
  type: 'tableColumnsMigration',
};
