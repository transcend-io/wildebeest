// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Change a column definition
 */
export default {
  configure: ({
    columnName,
    // tables,
    modelContainer,
    model,
  }) => ({
    name: `change-column-${columnName}`,
    comment: `Change column "${columnName}" on table ${linkToClass(
      modelContainer,
      model,
    )}`,
    // comment: `Change column ${columnName} on tables ${tables.map(({ modelContainer, model }) => linkToClass(modelContainer, model)).join(', ')}`, // eslint-disable-line max-len
  }),
  description: 'Change a column definition',
  prompts: {
    oldDefinition: {
      message: 'What is the old column definition?',
      extension: 'hbs',
      type: 'editor',
    },
    newDefinition: {
      message: 'What is the new definition?',
      extension: 'hbs',
      type: 'editor',
    },
  },
  type: 'tableColumnMigration', // TODO 'tablesColumnMigration',
};
