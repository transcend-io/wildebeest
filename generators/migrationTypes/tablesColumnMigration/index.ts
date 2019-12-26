// external modules
import intersection from 'lodash/intersection';

// migrationTypes
import { listAllAttributes } from '../tableColumnMigration/lib';

/**
 * A higher order generator that creates a Tables column migration migrator.
 *
 * Migrate the same column on multiple tables
 */
export default {
  parentType: 'tablesMigration',
  prompts: {
    columnName: (repo) => ({
      message: 'What column should be modified? (suggestOnly)',
      source: ({ tables }) =>
        intersection(
          tables.map(({ modelPath }) => listAllAttributes(repo, modelPath)),
        ),
      suggestOnly: true,
      type: 'autocomplete',
    }),
  },
};
