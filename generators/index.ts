/**
 *
 * ## Migrate Kinds
 * Create a db migration
 *
 * @module migrate
 */

// external modules
const difference = require('lodash/difference');

// commons
const cases = require('@commons/cases');

// global
const logger = require('@generators/logger');
const convertToPlop = require('@generators/utils/convertToPlop');

// Get the generators
module.exports = {
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
      .map((fil) => cases.paramCase(fil.split('.')[0]))
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
