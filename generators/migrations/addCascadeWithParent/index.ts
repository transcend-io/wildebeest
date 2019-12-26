// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Migrate a column so that it cascades with its parent
 */
export default {
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
