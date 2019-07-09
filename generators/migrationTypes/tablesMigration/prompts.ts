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
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.tables = {
  childName: 'table',
  message: 'Choose another table?',
  prompts: {
    modelPath: {
      type: 'modelPath',
    },
  },
  type: 'recursive',
};
