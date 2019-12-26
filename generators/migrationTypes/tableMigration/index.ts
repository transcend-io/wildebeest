/**
 * Create a migration that modifies a single table
 */
export default {
  parentType: 'dbMigration',
  prompts: {
    modelPath: (repo, { suggestOnly }) => ({
      message: `What db model are you migrating?${
        suggestOnly ? ' (suggestOnly)' : ''
      }`,
      suggestOnly,
      type: 'modelPath',
    }),
  },
};
