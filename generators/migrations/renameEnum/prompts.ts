/**
 *
 * ## RenameEnum Prompts
 * Plop prompt definitions for the rename enum migration.
 *
 * @module renameEnum/prompts
 * @see module:renameEnum
 */

// global
const { NOT_EMPTY_REGEX } = require('@generators/regexs');

/**
 * Determine the old name of the enum
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldName = {
  message: 'What was the old enum name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
};
