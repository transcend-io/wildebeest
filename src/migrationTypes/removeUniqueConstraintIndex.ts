// migrators
import reverseMigrator from '@wildebeest/helpers/reverseMigrator';

// local
import addUniqueConstraintIndex from './addUniqueConstraintIndex';

/**
 * Remove a unique constrain across multiple columns on up, and add it back on down
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for making a unique constraint across multiple columns
 * @returns The remove unique constraint index migrator migrator
 */
export default reverseMigrator(addUniqueConstraintIndex);
