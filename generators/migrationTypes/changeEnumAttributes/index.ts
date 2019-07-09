/**
 *
 * ## ChangeEnumAttributes Migration Type
 * A higher order generator that creates a Change enum attributes migrator.
 *
 * Changing attributes of an enum
 *
 * @module changeEnumAttributes
 * @see module:changeEnumAttributes/lib
 * @see module:changeEnumAttributes/prompts
 * @see module:changeEnumAttributes/regexs
 */

// local
const prompts = require('./prompts');

module.exports = {
  parentType: 'alterEnum',
  prompts,
};
