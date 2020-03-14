/**
 * Make a uuid column non null
 */

export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `uuid-non-null-${modelTableName}-${columnName}`,
    comment: `Change column ${model}.${columnName} to be NON NULL.`,
  }),
  description: 'Make a uuid column non null',
  type: 'tableAssociationColumn',
};
