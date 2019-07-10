/**
 *
 * ## Migrate Kinds
 * Create a db migration
 *
 * @module migrate
 */

// external modules
import difference from 'lodash/difference';
import kebabCase from 'lodash/kebabCase';

// global
import logger from '@generators/logger';
import convertToPlop from '@generators/utils/convertToPlop';

// Get the generators
export default {
  description: 'Run a db migration',
  getGenerators: (
    { actions, cwdFilter, description, generatorName, location, prompts },
    { count, cwdLocation, name, options },
    repo,
  ) => {
    // The refactor generator
    const generators = [
      {
        generatorName,
        name,
        count,
        init: convertToPlop(
          {
            actions,
            cwdFilter,
            cwdLocation,
            description,
            location,
            options,
            prompts,
          },
          repo,
        ),
      },
    ];

    return generators;
  },
  // Check that all migrationTypes have a corresponding generator
  postSetup: (generators, repo) => {
    // The migrationTypes that have been defined
    const migrationTypes = repo
      .listEntryFiles('migrations/migrationTypes')
      .map((fil) => kebabCase(fil.split('.')[0]))
      .filter((fil) => !['index', 'skip'].includes(fil));

    // The existing generators
    const migrationTypesGenerators = generators.map(({ name }) => name);

    // Missing generators
    const missing = difference(migrationTypes, migrationTypesGenerators);
    if (missing.length) {
      logger.error(`Missing migration generators for: "${missing.join(', ')}"`);
    }
  },
};
