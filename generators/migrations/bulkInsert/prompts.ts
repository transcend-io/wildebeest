/**
 *
 * ## BulkInsert Prompts
 * Prompts for the bulk insert migration.
 *
 * @module bulkInsert/prompts
 */

/**
 * Extension on name
 *
 * @returns The prompt
 */
export const nameExt = {
  message:
    'Name the migration (will be appended after "bulk-insert-{{ modelTableName }}-"',
  type: 'name',
};
