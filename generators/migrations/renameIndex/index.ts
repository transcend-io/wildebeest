/**
 *
 * ## Rename Index Migration Generator
 * Rename an index
 *
 * @module renameIndex
 * @see module:renameIndex/prompts
 */

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({ oldName, newName }) => ({
    name: `rename-index-to-${newName}`,
    comment: `Rename the index ${oldName} to ${newName}.`,
  }),
  description: 'Rename an index',
  prompts,
  type: 'dbMigration',
};
