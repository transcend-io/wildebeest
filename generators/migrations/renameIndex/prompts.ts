/**
 *
 * ## RenameIndex Prompts
 * Plop prompt definitions for the rename index migration.
 *
 * @module renameIndex/prompts
 * @see module:renameIndex
 */

// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * The old name of the index
 *
 * @returns The prompt
 */
export const oldName = {
  message: 'What is the old index name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
};

/**
 * The new name of the index
 *
 * @returns The prompt
 */
export const newName = {
  message: 'What is the new name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'newName is required',
};
