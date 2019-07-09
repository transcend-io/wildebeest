/**
 *
 * ## AddIndex Prompts
 * Plop prompt definitions for the add index migration.
 *
 * @module addIndex/prompts
 * @see module:addIndex
 */

// commons
const { INDEX_METHOD } = require('@commons/db/enums');

/**
 * The index method
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.method = {
  default: INDEX_METHOD.BTREE,
  message: 'What method of index?',
  source: () => Object.values(INDEX_METHOD),
  type: 'autocomplete',
};
