/**
 * Migrate a column so that it cascades with its parent
 */
export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `add-cascade-with-parent-${modelTableName}-${columnName}`,
    comment: `Add cascade with parent constraint to ${model}.${columnName}.`,
  }),
  description: 'Migrate a column so that it cascades with its parent',
  type: 'tableAssociationColumn',
};
