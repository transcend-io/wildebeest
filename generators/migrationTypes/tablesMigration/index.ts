/**
 * A higher order generator that creates a Tables migration migrator.
 *
 * Migrate multiple tables at the same time
 */
export default {
  parentType: 'dbMigration',
  prompts: {
    tables: {
      childName: 'table',
      message: 'Choose another table?',
      prompts: {
        modelPath: {
          type: 'modelPath',
        },
      },
      type: 'recursive',
    },
  },
};
