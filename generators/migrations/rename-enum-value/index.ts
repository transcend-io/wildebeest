// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * Rename an enum value in place
 */
export default {
  configure: ({ enumName, oldValue, newValue }) => ({
    name: `rename-enum-${enumName}-value-${oldValue}-to-${newValue}`,
    comment: `Rename ${oldValue} to ${newValue} on enum ${enumName}`,
  }),
  description: 'Rename an enum value in place',
  type: 'alterEnum',
  prompts: {
    oldValue: {
      message: 'What is the old value?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'oldValue is required',
    },
    newValue: {
      message: 'What is the new value?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'newValue is required',
    },
  },
};
