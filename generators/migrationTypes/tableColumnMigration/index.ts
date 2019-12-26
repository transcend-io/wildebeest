// local
import { listAllAttributes } from './lib';

/**
 * A higher order generator that creates a Table column migration migrator.
 *
 * Migrate a table column
 */
export default {
  parentType: 'tableMigration',
  prompts: {
    columnName: (repo, { columnSuggestOnly = true }) => ({
      message: `What column should be modified? ${
        columnSuggestOnly ? '(suggestOnly)' : ''
      }`,
      source: ({ modelPath }) => listAllAttributes(repo, modelPath),
      suggestOnly: columnSuggestOnly,
      type: 'autocomplete',
    }),
  },
};
