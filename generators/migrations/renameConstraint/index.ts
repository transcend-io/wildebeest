// external modules
import kebabCase from 'lodash/kebabCase';

// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Rename a table column constraint
 */
export default {
  configure: ({ modelContainer, model, columnName, newName, oldName }) => ({
    name: `rename-constraint-${kebabCase(newName)}`,
    comment: `Rename the constraint ${oldName} for ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} to ${newName}.`,
  }),
  description: 'Rename a table column constraint',
  prompts: {
    oldName: {
      message: 'What was the old name of the constraint?',
      type: 'name',
    },
    newName: {
      message: 'What is the new name of the constraint?',
      type: 'name',
    },
  },
  type: 'tableColumnMigration',
};
