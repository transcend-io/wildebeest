/**
 *
 * ## RenameTable Prompts
 * Prompts for the rename table migration.
 *
 * @module renameTable/prompts
 */

/**
 * The old table name
 *
 * @returns The prompt
 */
export const oldName = {
  message: 'What was the old name of the table?',
  type: 'name',
};

/**
 * What is the new name of the table?
 *
 * @returns The prompt
 */
export const newName = {
  message: 'What is the new name of the table?',
  type: 'name',
};
