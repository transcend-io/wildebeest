/**
 *
 * ## BulkDelete Prompts
 * Prompts for the bulk delete migration.
 *
 * @module bulkDelete/prompts
 * @see module:bulkDelete
 */

/**
 * Extension on name
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const nameExt = {
  message:
    'Name the migration (will be appended after "bulk-delete-{{ modelTableName }}-"',
  type: 'name',
};
