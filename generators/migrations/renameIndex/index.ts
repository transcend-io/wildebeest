// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * Rename an index
 */
export default {
  configure: ({ oldName, newName }) => ({
    name: `rename-index-to-${newName}`,
    comment: `Rename the index ${oldName} to ${newName}.`,
  }),
  description: 'Rename an index',
  prompts: {
    oldName: {
      message: 'What is the old index name?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
    },
    newName: {
      message: 'What is the new name?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'newName is required',
    },
  },
  type: 'dbMigration',
};
