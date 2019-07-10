/**
 *
 * ## TablesColumnMigration Prompts
 * Prompts for the tables column migration migrationType.
 *
 * @module tablesColumnMigration/prompts
 * @see module:tablesColumnMigration
 */

// external modules
import intersection from 'lodash/intersection';

// migrationTypes
import { listAllAttributes } from '../tableColumnMigration/lib';

/**
 * The name of the column to migrate
 *
 * @param repo - The repository configuration
 * @returns The prompt
 */
export const columnName = (repo) => ({
  message: 'What column should be modified? (suggestOnly)',
  source: ({ tables }) =>
    intersection(
      tables.map(({ modelPath }) => listAllAttributes(repo, modelPath)),
    ),
  suggestOnly: true,
  type: 'autocomplete',
});
