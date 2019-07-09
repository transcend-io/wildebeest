/**
 *
 * ## TableAssociationColumn Prompts
 * Prompts for the table association column migrationType.
 *
 * @module tableAssociationColumn/prompts
 * @see module:tableAssociationColumn
 */

// local
import { getAssociations } from './lib';

/**
 * The name of the association column
 *
 * @param {module:commons--Repository.Repository} repo - The repository configuration
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const columnName = (repo) => ({
  message: 'What column should be modified? (suggestOnly)',
  source: ({ modelPath }) =>
    getAssociations(modelPath, repo)
      .filter(({ associationType }) => associationType === 'belongsTo')
      .map(({ name }) => `${name}Id`),
  suggestOnly: true,
  type: 'autocomplete',
});
