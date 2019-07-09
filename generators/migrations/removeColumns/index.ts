/**
 *
 * ## Remove Columns Migration Generator
 * Remove multiple columns on up, and add them back on down
 *
 * @module removeColumns
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
  configure: ({ modelTableName, columns, modelContainer, model }) => ({
    name: `remove-columns-${modelTableName}-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Remove columns (${columns
      .map(({ columnName }) => columnName)
      .join(', ')}) to ${linkToClass(modelContainer, model)}.`, // eslint-disable-line max-len
  }),
  description: 'Remove multiple columns on up, and add them back on down',
  columnSuggestOnly: true,
  withGetRowDefaults: true,
  type: 'tableColumnsMigration',
};
