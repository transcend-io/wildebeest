/**
 *
 * ## TablesMigration Prompts
 * Prompts for the tables migration migrationType.
 *
 * @module tablesMigration/prompts
 * @see module:tablesMigration
 */

/**
 * The tables to modify
 *
 * @returns The prompt
 */
export const tables = {
  childName: 'table',
  message: 'Choose another table?',
  prompts: {
    modelPath: {
      type: 'modelPath',
    },
  },
  type: 'recursive',
};
