// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Make a column non null
 */
export default {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `make-column-non-null-${modelTableName}-${columnName}`,
    comment: `Make the column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} non null.`,
  }),
  description: 'Make a column non null',
  // columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
