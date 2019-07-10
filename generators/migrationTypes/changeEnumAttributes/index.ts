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
import * as prompts from './prompts';

export default {
  parentType: 'alterEnum',
  prompts,
};
