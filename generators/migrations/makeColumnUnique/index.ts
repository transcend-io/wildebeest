// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Make a table column unique
 */
export default {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `make-column-unique-${modelTableName}-${columnName}`,
    comment: `Add a constraint to make ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} unique.`,
  }),
  description: 'Make a table column unique',
  columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
