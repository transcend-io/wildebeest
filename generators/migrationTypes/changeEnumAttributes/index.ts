/**
 *
 * ## ChangeEnumAttributes Migration Type
 * A higher order generator that creates a Change enum attributes migrator.
 *
 * Changing attributes of an enum
 *
 * @module changeEnumAttributes
 */

// local
import * as prompts from './prompts';

export default {
  parentType: 'alterEnum',
  prompts,
};
