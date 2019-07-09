/**
 *
 * ## RemoveIndex Prompts
 * Plop prompt definitions for the remove index migration.
 *
 * @module removeIndex/prompts
 * @see module:removeIndex
 */

const { method } = require('../addIndex/prompts');

/**
 * The index method
 *
 * @see module:addIndex/prompts.method
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.method = method;
