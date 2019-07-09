// migrators
import reverseMigrator from '@wildebeest/helpers/reverseMigrator';

// local
import makeColumnNonNull from './makeColumnNonNull';

/**
 * Make a column allow null values
 *
 * @memberof module:migrationTypes
 *
 * @param options - The make column allow null options
 * @returns The make column allow null migrator
 */
export default reverseMigrator(makeColumnNonNull);
