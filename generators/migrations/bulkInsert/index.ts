/**
 * Run a bulk insert
 */
export default {
  configure: ({ modelTableName, modelContainer, nameExt }) => ({
    name: `bulk-insert-${modelTableName}${nameExt ? `-${nameExt}` : ''}`,
    comment: `Bulk insert into table [${modelTableName}]{@link module:${modelContainer}}`,
  }),
  description: 'Run a bulk insert',
  prompts: {
    nameExt: {
      message:
        'Name the migration (will be appended after "bulk-insert-{{ modelTableName }}-"',
      type: 'name',
    },
  },
  type: 'tableMigration',
};
