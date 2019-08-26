/**
 *
 * ## ChangeColumn Prompts
 * Prompts for the change column migration.
 *
 * @module changeColumn/prompts
 */

/**
 * What is the old definition?
 *
 * @returns The prompt
 */
export const oldDefinition = {
  message: 'What is the old column definition?',
  extension: 'hbs',
  type: 'editor',
};

/**
 * What is the new definition?
 *
 * @returns The prompt
 */
export const newDefinition = {
  message: 'What is the new definition?',
  extension: 'hbs',
  type: 'editor',
};
