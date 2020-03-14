// global
import { NOT_EMPTY_REGEX } from '@generators/regexes';

/**
 * Rename an enum from one value to another
 */
export default {
  configure: ({ oldName, columnName, modelTableName, model }) => {
    const newName = `enum_${modelTableName}_${columnName}`;
    return {
      name: `rename-${oldName}-to-${newName}`,
      newName,
      comment: `Rename the enum definition for ${model}.${columnName} to ${newName}`,
    };
  },
  description: 'Rename an enum from one value to another',
  prompts: {
    oldName: {
      message: 'What was the old enum name?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'oldName is required',
    },
  },
  type: 'tableColumnMigration',
};
