/**
 *
 * ## RenameEnum Prompts
 * Plop prompt definitions for the rename enum migration.
 *
 * @module renameEnum/prompts
 * @see module:renameEnum
 */

// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * Determine the old name of the enum
 *
 * @returns The prompt
 */
export const oldName = {
  message: 'What was the old enum name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
};
