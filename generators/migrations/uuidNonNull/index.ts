/**
 *
 * ## Uuid Non Null Migration Generator
 * Make a uuid column non null
 *
 * @module uuidNonNull
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
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
