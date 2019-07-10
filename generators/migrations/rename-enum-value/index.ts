/**
 *
 * ## Rename Enum Value Migration Generator
 * Rename an enum value in place
 *
 * @module rename-enum-value
 * @see module:rename-enum-value/prompts
 */

// local
import * as prompts from './prompts';

export default {
  configure: ({ enumName, oldValue, newValue }) => ({
    name: `rename-enum-${enumName}-value-${oldValue}-to-${newValue}`,
    comment: `Rename ${oldValue} to ${newValue} on enum ${enumName}`,
  }),
  description: 'Rename an enum value in place',
  type: 'alterEnum',
  prompts,
};
