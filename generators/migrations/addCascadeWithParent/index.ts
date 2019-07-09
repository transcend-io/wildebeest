/**
 *
 * ## Add Cascade With Parent Migration Generator
 * Migrate a column so that it cascades with its parent
 *
 * @module addCascadeWithParent
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
  configure: ({ modelTableName, modelContainer, columnName, model }) => ({
    name: `add-cascade-with-parent-${modelTableName}-${columnName}`,
    comment: `Add cascade with parent constraint to ${linkToClass(
      modelContainer,
      model,
      columnName,
    )}.`,
  }),
  description: 'Migrate a column so that it cascades with its parent',
  type: 'tableAssociationColumn',
};
