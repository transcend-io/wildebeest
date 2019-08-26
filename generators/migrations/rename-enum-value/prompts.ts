/**
 *
 * ## RenameEnumValue Prompts
 * Plop prompt definitions for the rename enum value migration.
 *
 * @module rename-enum-value/prompts
 */

// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * The old value of the enum
 *
 * @returns The prompt
 */
export const oldValue = {
  message: 'What is the old value?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldValue is required',
};

/**
 * The new value of the enum
 *
 * @returns The prompt
 */
export const newValue = {
  message: 'What is the new value?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'newValue is required',
};
