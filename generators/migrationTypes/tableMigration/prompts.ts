/**
 *
 * ## TableMigration Prompts
 * Prompts for the table migration migrationType.
 *
 * @module tableMigration/prompts
 */

/**
 * Determine the name of the table to be modified
 *
 * @param repo - The repository configuration
 * @returns The prompt
 */
export const modelPath = (repo, { suggestOnly }) => ({
  message: `What db model are you migrating?${
    suggestOnly ? ' (suggestOnly)' : ''
  }`,
  suggestOnly,
  type: 'modelPath',
});
