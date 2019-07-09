/**
 *
 * ## Add Index Migration Generator
 * Add a new index to a table
 *
 * @module addIndex
 * @see module:addIndex/prompts
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
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
