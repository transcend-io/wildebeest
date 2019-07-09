// migrators
import reverseMigrator from '@wildebeest/utils/reverseMigrator';

// local
import addIndex from './addIndex';

/**
 * Remove an existing index
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for making a unique constraint across multiple columns
 * @returns The remove index migrator
 */
export default reverseMigrator(addIndex);
