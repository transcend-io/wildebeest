/**
 * Change a column definition
 */
export default {
  configure: ({ columnName, model }) => ({
    name: `change-column-${columnName}`,
    comment: `Change column "${columnName}" on table ${model}`,
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
