// external modules
import kebabCase from 'lodash/kebabCase';

// global
import linkToClass from '@generators/utils/linkToClass';
import { OnDelete } from '@wildebeest/types';

/**
 * Change the onDelete status of a foreign key constraint
 */
export default {
  configure: ({
    modelTableName,
    modelContainer,
    model,
    columnName,
    newOnDelete,
    oldOnDelete,
  }) => ({
    name: `change-on-delete-${modelTableName}-${columnName}-to-${kebabCase(
      newOnDelete,
    )}`,
    comment: `Change the foreign key constraint for column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} from ${oldOnDelete} to ${newOnDelete}`,
  }),
  description: 'Change the onDelete status of a foreign key constraint',
  prompts: {
    oldOnDelete: {
      message: 'What was the old onDelete value?',
      source: () => Object.values(OnDelete),
      type: 'autocomplete',
    },
    newOnDelete: {
      message: 'What is the new onDelete value?',
      source: ({ oldOnDelete }) =>
        Object.values(OnDelete).filter((val) => val !== oldOnDelete),
      type: 'autocomplete',
    },
  },
  type: 'tableColumnMigration',
};
