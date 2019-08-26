/**
 *
 * ## Add Index Migration Generator
 * Add a new index to a table
 *
 * @module addIndex
 */

// global
import linkToClass from '@generators/utils/linkToClass';

// local
import * as prompts from './prompts';

export default {
  configure: ({ columns, modelContainer, model }) => ({
    name: `add-index-${columns.map(({ columnName }) => columnName).join('-')}`,
    comment: `Add index on ${linkToClass(
      modelContainer,
      model,
    )} fields: ${columns.map(({ columnName }) => columnName).join(', ')}.`,
  }),
  description: 'Add a new index to a table',
  prompts,
  type: 'tableColumnsMigration',
};
