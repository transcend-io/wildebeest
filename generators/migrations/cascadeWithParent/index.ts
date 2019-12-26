// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Update a column to have an on delete cascade when it's parent is cascaded
 */
export default {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `cascade-with-parent-${modelTableName}-${columnName}`,
    comment: `Update constraint for the column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} to cascade with parent.`,
  }),
  description:
    "Update a column to have an on delete cascade when it's parent is cascaded",
  type: 'tableAssociationColumn',
};
