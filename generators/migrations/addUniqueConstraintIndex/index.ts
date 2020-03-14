/**
 * Add a unique constrain across multiple columns on up, and remove the constraint on down
 */
export default {
  configure: ({ columns, model }) => ({
    name: `add-unique-constraint-index-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Add unique index on ${model} fields: ${columns
      .map(({ columnName }) => columnName)
      .join(', ')}.`, // eslint-disable-line max-len
  }),
  description:
    'Add a unique constrain across multiple columns on up, and remove the constraint on down',
  skipColumnPrompts: true,
  type: 'tableColumnsMigration',
};
