/**
 *
 * ## Rename Enum Migration Generator
 * Rename an enum from one value to another
 *
 * @module renameEnum
 * @see module:renameEnum/prompts
 */

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import * as prompts from './prompts';

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
  prompts,
  type: 'tableColumnMigration',
};
