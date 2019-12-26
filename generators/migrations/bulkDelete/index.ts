/**
 * Bulk delete table rows
 */
export default {
  configure: ({ modelTableName, modelContainer, nameExt }) => ({
    name: `bulk-delete-${modelTableName}${nameExt ? `-${nameExt}` : ''}`,
    comment: `Bulk delete from table [${modelTableName}]{@link module:${modelContainer}}`,
  }),
  description: 'Bulk delete table rows',
  prompts: {
    nameExt: {
      message:
        'Name the migration (will be appended after "bulk-delete-{{ modelTableName }}-"',
      type: 'name',
    },
  },
  type: 'tableMigration',
};
