/**
 *
 * ## Remove Index Migration Generator
 * Remove an existing index
 *
 * @module removeIndex
 * @see module:removeIndex/prompts
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({ columns, modelContainer, model }) => ({
    name: `remove-index-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Remove index on ${linkToClass(
      modelContainer,
      model,
    )} fields: ${columns.map(({ columnName }) => columnName).join(', ')}.`, // eslint-disable-line max-len
  }),
  description: 'Remove an existing index',
  prompts,
  type: 'tableColumnsMigration',
};
