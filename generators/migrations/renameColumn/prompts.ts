/**
 *
 * ## RenameColumn Prompts
 * Prompts for the rename column migration.
 *
 * @module renameColumn/prompts
 * @see module:renameColumn
 */

// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * The old column name
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const oldName = {
  message: 'What was the old column name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
};

/**
 * What is the new column name?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const newName = {
  message: 'What is the new column name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'newName is required',
};
