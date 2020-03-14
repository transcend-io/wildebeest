/**
 * Update a column to have an on delete cascade when it's parent is cascaded
 */
export default {
  configure: ({ modelTableName, columnName, model }) => ({
    name: `cascade-with-parent-${modelTableName}-${columnName}`,
    comment: `Update constraint for the column ${model}.${columnName} to cascade with parent.`,
  }),
  description:
    "Update a column to have an on delete cascade when it's parent is cascaded",
  type: 'tableAssociationColumn',
};
