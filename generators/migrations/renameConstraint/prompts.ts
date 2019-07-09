/**
 *
 * ## RenameConstraint Prompts
 * Prompts for the rename constraint migration.
 *
 * @module renameConstraint/prompts
 * @see module:renameConstraint
 */

/**
 * The old constraint name
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldName = {
  message: 'What was the old name of the constraint?',
  type: 'name',
};

/**
 * What is the new name of the constraint?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.newName = {
  message: 'What is the new name of the constraint?',
  type: 'name',
};
