/**
 *
 * ## Bulk Delete Generator
 * Bulk delete table rows
 *
 * @module bulkDelete
 * @see module:bulkDelete/prompts
 */

// local
import * as prompts from './prompts';

export default {
  configure: ({ modelTableName, modelContainer, nameExt }) => ({
    name: `bulk-delete-${modelTableName}${nameExt ? `-${nameExt}` : ''}`,
    comment: `Bulk delete from table [${modelTableName}]{@link module:${modelContainer}}`,
  }),
  description: 'Bulk delete table rows',
  prompts,
  type: 'tableMigration',
};
