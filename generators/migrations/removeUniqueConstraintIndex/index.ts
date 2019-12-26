// global
import linkToClass from '@generators/utils/linkToClass';

/**
 * Remove a unique constrain across multiple columns on up, and add it back on down
 */
export default {
  configure: ({ columns, modelContainer, model }) => ({
    name: `remove-unique-constraint-index-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Remove unique index on ${linkToClass(
      modelContainer,
      model,
    )} fields: ${columns.map(({ columnName }) => columnName).join(', ')}.`, // eslint-disable-line max-len
  }),
  description:
    'Remove a unique constrain across multiple columns on up, and add it back on down',
  suggestOnly: true,
  type: 'tableColumnsMigration',
};
