/**
 *
 * ## DbMigration Generator Type
 * A higher order generator that creates a Db migration
 *
 * A database migration
 *
 * @module dbMigration
 * @see module:dbMigration/actions
 */

// commons
import getNextNumber from '@wildebeest/utils/getNextNumber';

// local
const actions = require('./actions');

module.exports = {
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
