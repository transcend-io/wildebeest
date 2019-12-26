// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Make a column allow null values
 */
export default {
  configure: ({ modelTableName, columnName, modelContainer, model }) => ({
    name: `make-column-allow-null-${modelTableName}-${columnName}`,
    comment: `Make the column ${linkToClass(
      modelContainer,
      model,
      columnName,
    )} allow null values.`,
  }),
  description: 'Make a column allow null values',
  // columnSuggestOnly: false,
  type: 'tableColumnMigration',
};
