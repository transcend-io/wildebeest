/**
 *
 * ## RenameConstraint Prompts
 * Prompts for the rename constraint migration.
 *
 * @module renameConstraint/prompts
 */

/**
 * The old constraint name
 *
 * @returns The prompt
 */
export const oldName = {
  message: 'What was the old name of the constraint?',
  type: 'name',
};

/**
 * What is the new name of the constraint?
 *
 * @returns The prompt
 */
export const newName = {
  message: 'What is the new name of the constraint?',
  type: 'name',
};
