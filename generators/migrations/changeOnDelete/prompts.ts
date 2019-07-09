/**
 *
 * ## ChangeOnDelete Prompts
 * Plop prompt definitions for the change on delete migration.
 *
 * @module changeOnDelete/prompts
 * @see module:changeOnDelete
 */

// commons
const { ON_DELETE } = require('@commons/db/enums');

/**
 * The old onDelete value
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.oldOnDelete = {
  message: 'What was the old onDelete value?',
  source: () => Object.values(ON_DELETE),
  type: 'autocomplete',
};

/**
 * What is the new onDelete value?
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
module.exports.newOnDelete = {
  message: 'What is the new onDelete value?',
  source: ({ oldOnDelete }) =>
    Object.values(ON_DELETE).filter((val) => val !== oldOnDelete),
  type: 'autocomplete',
};
