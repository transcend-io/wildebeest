// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';
import linkToClass from '@generators/utils/linkToClass';

/**
 * Create a migration definition that renames a column
 */
export default {
  configure: ({ modelTableName, newName, oldName, modelContainer, model }) => ({
    name: `rename-column-${modelTableName}-to-${newName}`,
    comment: `Rename the column ${oldName} to ${newName} on table ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Create a migration definition that renames a column',
  prompts: {
    oldName: {
      message: 'What was the old column name?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
    },
    newName: {
      message: 'What is the new column name?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'newName is required',
    },
  },
  type: 'tableMigration',
};
