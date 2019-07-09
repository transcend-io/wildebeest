/**
 *
 * ## ChangeColumn Prompts
 * Prompts for the change column migration.
 *
 * @module changeColumn/prompts
 * @see module:changeColumn
 */

/**
 * What is the old definition?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldDefinition = {
  message: 'What is the old column definition?',
  extension: 'hbs',
  type: 'editor',
};

/**
 * What is the new definition?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.newDefinition = {
  message: 'What is the new definition?',
  extension: 'hbs',
  type: 'editor',
};
