/**
 *
 * ## ChangeEnumColumn Prompts
 * Prompts for the change enum column migration.
 *
 * @module changeEnumColumn/prompts
 * @see module:changeEnumColumn
 */

/**
 * The old enum attributes
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const oldAttributes = {
  message: 'What are the old enum attributes?',
  extension: 'hbs',
  type: 'editor',
};

/**
 * What are the new enum attributes?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const newAttributes = {
  message: 'What are the new enum attributes?',
  extension: 'hbs',
  type: 'editor',
};

/**
 * The old default value
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const oldDefault = {
  message: 'What is the old default value?',
  type: 'input',
};

/**
 * The new default value
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const newDefault = {
  message: 'What is the new default value?',
  type: 'input',
};
