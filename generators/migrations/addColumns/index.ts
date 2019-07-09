/**
 *
 * ## Add Columns Migration Generator
 * Add columns to a table
 *
 * @module addColumns
 */

// global
import linkToClass from '@generators/utils/linkToClass';

module.exports = {
  configure: ({ modelTableName, columns, modelContainer, model }) => ({
    name: `add-columns-${modelTableName}-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Add columns (${columns
      .map(({ columnName }) => columnName)
      .join(', ')}) to ${linkToClass(modelContainer, model)}.`, // eslint-disable-line max-len
  }),
  description: 'Add columns to a table',
  withGetRowDefaults: true,
  type: 'tableColumnsMigration',
};
