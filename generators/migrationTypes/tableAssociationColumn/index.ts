// local
import { getAssociations } from './lib';

/**
 * A higher order generator that creates a Table association column migrator.
 *
 * A migrator for table column that is an association
 */
export default {
  parentType: 'tableMigration',
  prompts: {
    columnName: (repo) => ({
      message: 'What column should be modified? (suggestOnly)',
      source: ({ modelPath }) =>
        getAssociations(modelPath, repo)
          .filter(({ associationType }) => associationType === 'belongsTo')
          .map(({ name }) => `${name}Id`),
      suggestOnly: true,
      type: 'autocomplete',
    }),
  },
};
