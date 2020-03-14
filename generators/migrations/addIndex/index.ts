// commons
import { IndexMethod } from '@wildebeest/types';

/**
 * Add a new index to a table
 */
export default {
  configure: ({ columns, model }) => ({
    name: `add-index-${columns.map(({ columnName }) => columnName).join('-')}`,
    comment: `Add index on ${model} fields: ${columns
      .map(({ columnName }) => columnName)
      .join(', ')}.`,
  }),
  description: 'Add a new index to a table',
  prompts: {
    method: {
      default: IndexMethod.BTree,
      message: 'What method of index?',
      source: () => Object.values(IndexMethod),
      type: 'autocomplete',
    },
  },
  type: 'tableColumnsMigration',
};
