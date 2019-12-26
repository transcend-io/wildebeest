// migrators
import reverseMigrator from '@wildebeest/utils/reverseMigrator';

// local
import addUniqueConstraintIndex from './addUniqueConstraintIndex';

/**
 * Remove a unique constrain across multiple columns on up, and add it back on down
 *
 * @param options - Options for making a unique constraint across multiple columns
 * @returns The remove unique constraint index migrator migrator
 */
export default reverseMigrator(addUniqueConstraintIndex);
