/**
 *
 * ## TableMigration Prompts
 * Prompts for the table migration migrationType.
 *
 * @module tableMigration/prompts
 * @see module:tableMigration
 */

/**
 * Determine the name of the table to be modified
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.modelPath = (repo, { suggestOnly }) => ({
  message: `What db model are you migrating?${
    suggestOnly ? ' (suggestOnly)' : ''
  }`,
  suggestOnly,
  type: 'modelPath',
});
