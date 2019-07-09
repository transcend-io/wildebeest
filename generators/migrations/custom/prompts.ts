/**
 *
 * ## Custom Prompts
 * Prompts for the custom migration.
 *
 * @module custom/prompts
 * @see module:custom
 */

/**
 * Determine the name of the migration
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const name = {
  message: 'What is the migration name?',
  nameTransform: 'paramCase',
  type: 'name',
};

/**
 * What is the migration comment?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const comment = {
  message: 'What is the migration comment?',
  type: 'comment',
};
