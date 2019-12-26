/**
 * Rename a table
 */
export default {
  configure: ({ newName, oldName }) => ({
    name: `rename-table-to-${newName}`,
    comment: `Rename the table ${oldName} to ${newName}.`,
  }),
  description: 'Rename a table',
  prompts: {
    oldName: {
      message: 'What was the old name of the table?',
      type: 'name',
    },
    newName: {
      message: 'What is the new name of the table?',
      type: 'name',
    },
  },
  type: 'dbMigration',
};
