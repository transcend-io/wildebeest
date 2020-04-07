// external
import kebabCase from 'lodash/kebabCase';

/**
 * Rename a table column constraint
 */
export default {
  configure: ({ model, columnName, newName, oldName }) => ({
    name: `rename-constraint-${kebabCase(newName)}`,
    comment: `Rename the constraint ${oldName} for ${model}.${columnName} to ${newName}.`,
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
