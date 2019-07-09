/**
 *
 * ## Drop Table Migration Generator
 * Drop one of the tables
 *
 * @module dropTable
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

module.exports = {
  configure: ({ modelTableName, modelContainer, model }) => ({
    name: `drop-table-${modelTableName}`,
    comment: `Drop the ${linkToClass(modelContainer, model)} table.`,
  }),
  description: 'Drop one of the tables',
  suggestOnly: true,
  type: 'tableColumnsMigration',
};
