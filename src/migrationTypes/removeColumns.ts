// migrators
import reverseMigrator from '@wildebeest/helpers/reverseMigrator';

// local
import addColumns from './addColumns';

/**
 * Remove multiple columns on up, and add them back on down
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for adding new columns to a table
 * @returns The remove columns migrator
 */
export default reverseMigrator(addColumns);
