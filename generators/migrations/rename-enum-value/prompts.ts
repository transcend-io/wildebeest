/**
 *
 * ## RenameEnumValue Prompts
 * Plop prompt definitions for the rename enum value migration.
 *
 * @module rename-enum-value/prompts
 * @see module:rename-enum-value
 */

// global
const { NOT_EMPTY_REGEX } = require('@generators/regexs');

/**
 * The old value of the enum
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldValue = {
  message: 'What is the old value?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'oldValue is required',
};

/**
 * The new value of the enum
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.newValue = {
  message: 'What is the new value?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'newValue is required',
};
