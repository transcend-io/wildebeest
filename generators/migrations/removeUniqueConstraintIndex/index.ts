/**
 * Remove a unique constrain across multiple columns on up, and add it back on down
 */
export default {
  configure: ({ columns, model }) => ({
    name: `remove-unique-constraint-index-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Remove unique index on ${model} fields: ${columns
      .map(({ columnName }) => columnName)
      .join(', ')}.`, // eslint-disable-line max-len
  }),
  description:
    'Remove a unique constrain across multiple columns on up, and add it back on down',
  suggestOnly: true,
  type: 'tableColumnsMigration',
};
