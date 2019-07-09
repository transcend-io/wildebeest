/**
 *
 * ## Cascade With Parent Migration Generator
 * Update a column to have an on delete cascade when it's parent is cascaded
 *
 * @module cascadeWithParent
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
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
