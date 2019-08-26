/**
 *
 * ## BulkDelete Prompts
 * Prompts for the bulk delete migration.
 *
 * @module bulkDelete/prompts
 */

/**
 * Extension on name
 *
 * @returns The prompt
 */
export const nameExt = {
  message:
    'Name the migration (will be appended after "bulk-delete-{{ modelTableName }}-"',
  type: 'name',
};
