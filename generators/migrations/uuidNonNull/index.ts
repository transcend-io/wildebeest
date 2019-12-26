/**
 * Make a uuid column non null
 */

// global
import linkToClass from '@generators/utils/linkToClass';

export default {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `uuid-non-null-${modelTableName}-${columnName}`,
    comment: `Change column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} to be NON NULL.`,
  }),
  description: 'Make a uuid column non null',
  type: 'tableAssociationColumn',
};
