/**
 *
 * ## TablesColumnMigration Prompts
 * Prompts for the tables column migration migrationType.
 *
 * @module tablesColumnMigration/prompts
 * @see module:tablesColumnMigration
 */

// external modules
const intersection = require('lodash/intersection');

// migrationTypes
const { listAllAttributes } = require('../tableColumnMigration/lib');

/**
 * The name of the column to migrate
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.columnName = (repo) => ({
  message: 'What column should be modified? (suggestOnly)',
  source: ({ tables }) =>
    intersection(
      tables.map(({ modelPath }) => listAllAttributes(repo, modelPath)),
    ),
  suggestOnly: true,
  type: 'autocomplete',
});
