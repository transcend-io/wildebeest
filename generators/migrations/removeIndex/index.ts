import { method } from '../addIndex/prompts';

/**
 * Remove an existing index
 */
export default {
  configure: ({ columns, model }) => ({
    name: `remove-index-${columns
      .map(({ columnName }) => columnName)
      .join('-')}`,
    comment: `Remove index on ${model} fields: ${columns
      .map(({ columnName }) => columnName)
      .join(', ')}.`, // eslint-disable-line max-len
  }),
  description: 'Remove an existing index',
  prompts: { method },
  type: 'tableColumnsMigration',
};
