/**
 *
 * ## RenameIndex Prompts
 * Plop prompt definitions for the rename index migration.
 *
 * @module renameIndex/prompts
 * @see module:renameIndex
 */

// global
const { NOT_EMPTY_REGEX } = require('@generators/regexs');

/**
 * The old name of the index
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldName = {
  message: 'What is the old index name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
};

/**
 * The new name of the index
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.newName = {
  message: 'What is the new name?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'newName is required',
};
