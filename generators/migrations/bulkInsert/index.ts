/**
 *
 * ## Bulk Insert Migration Generator
 * Run a bulk insert
 *
 * @module bulkInsert
 * @see module:bulkInsert/prompts
 */

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({ modelTableName, modelContainer, nameExt }) => ({
    name: `bulk-insert-${modelTableName}${nameExt ? `-${nameExt}` : ''}`,
    comment: `Bulk insert into table [${modelTableName}]{@link module:${modelContainer}}`,
  }),
  description: 'Run a bulk insert',
  prompts,
  type: 'tableMigration',
};
