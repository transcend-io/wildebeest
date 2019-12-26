// commons
import getNextNumber from '@wildebeest/utils/getNextNumber';

// local
import actions from './actions';

/**
 * A higher order generator that creates a Db migration
 *
 * A database migration
 */
export default {
  actions,
  configure: ({ location, generatorName }, repo) => ({
    migrationNumber: getNextNumber(repo.getEntryFolder(location)),
    templateName: repo.hasTemplate(generatorName)
      ? generatorName
      : 'db-migration',
  }),
  location: 'migrations/migrations',
  locationIsFolder: true,
  mode: 'backend',
  skipActions: true,
  requiredProps: [],
};
