/**
 *
 * ## RenameTable Prompts
 * Prompts for the rename table migration.
 *
 * @module renameTable/prompts
 * @see module:renameTable
 */

/**
 * The old table name
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldName = {
  message: 'What was the old name of the table?',
  type: 'name',
};

/**
 * What is the new name of the table?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.newName = {
  message: 'What is the new name of the table?',
  type: 'name',
};
