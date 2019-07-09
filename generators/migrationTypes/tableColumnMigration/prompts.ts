/**
 *
 * ## TableColumnMigration Prompts
 * Prompts for the table column migration migrationType.
 *
 * @module tableColumnMigration/prompts
 * @see module:tableColumnMigration
 */

// local
import { listAllAttributes } from './lib';

/**
 * The name of the column to migrate
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const columnName = (repo, { columnSuggestOnly = true }) => ({
  message: `What column should be modified? ${
    columnSuggestOnly ? '(suggestOnly)' : ''
  }`,
  source: ({ modelPath }) => listAllAttributes(repo, modelPath),
  suggestOnly: columnSuggestOnly,
  type: 'autocomplete',
});
