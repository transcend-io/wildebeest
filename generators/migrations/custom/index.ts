/**
 * A custom migration
 */
export default {
  configure: ({ modelTableName, name }) => ({
    name: `${modelTableName}-${name}`,
  }),
  description: 'A custom migration',
  prompts: {
    name: {
      message: 'What is the migration name?',
      nameTransform: 'paramCase',
      type: 'name',
    },
    comment: {
      message: 'What is the migration comment?',
      type: 'comment',
    },
  },
  type: 'tableMigration',
};
