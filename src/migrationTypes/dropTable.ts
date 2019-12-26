// migrators
import reverseMigrator from '@wildebeest/utils/reverseMigrator';

// local
import createTable from './createTable';

/**
 * Remove a table from the db and all associated parts
 *
 * @param options - Options for dropping a table
 * @returns The drop table migrator
 */
export default reverseMigrator(createTable);
