// generators
import migration from '../migration/prompts';

/**
 * Create a new generator to accompany a migration type
 *
 * TODO wildebeest
 */
export default {
  description: 'Create a new generator to accompany a migration type',
  displayGeneratorName: 'migration-type',
  location: 'migrationTypes',
  prompts: {
    generatorType: migration.prompts.generatorType,
  },
  type: 'generatorContainer',
};
