// global
import linkToClass from '@generators/utils/linkToClass';
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * Rename an enum from one value to another
 */
export default {
  configure: ({
    oldName,
    columnName,
    modelTableName,
    model,
    modelContainer,
  }) => {
    const newName = `enum_${modelTableName}_${columnName}`;
    return {
      name: `rename-${oldName}-to-${newName}`,
      newName,
      comment: `Rename the enum definition for ${linkToClass(
        modelContainer,
        model,
        columnName,
      )} to ${newName}`,
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
