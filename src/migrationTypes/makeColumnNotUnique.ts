// migrators
import reverseMigrator from '@wildebeest/utils/reverseMigrator';

// local
import makeColumnUnique from './makeColumnUnique';

/**
 * Remove a unique constrain on a column
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for making a column unique
 * @returns The remove unique constraint index migrator migrator
 */
export default reverseMigrator(makeColumnUnique);
