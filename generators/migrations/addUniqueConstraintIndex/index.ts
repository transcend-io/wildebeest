/**
 *
 * ## Add Unique Constraint Index Migration Generator
 * Add a unique constrain across multiple columns on up, and remove the constraint on down
 *
 * @module addUniqueConstraintIndex
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

module.exports = {
  configure: ({ columns, modelContainer, model }) => ({
    name: `add-unique-constraint-index-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Add unique index on ${linkToClass(
      modelContainer,
      model,
    )} fields: ${columns.map(({ columnName }) => columnName).join(', ')}.`, // eslint-disable-line max-len
  }),
  description:
    'Add a unique constrain across multiple columns on up, and remove the constraint on down',
  skipColumnPrompts: true,
  type: 'tableColumnsMigration',
};
