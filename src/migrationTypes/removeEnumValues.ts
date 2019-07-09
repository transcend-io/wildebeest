// migrators
import reverseMigrator from '@wildebeest/helpers/reverseMigrator';

// local
import addEnumValues from './addEnumValues';

/**
 * Remove values from an enum on up, and add them back on down
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for removing attributes from the enum
 * @returns The remove enum values migrator
 */
export default reverseMigrator(addEnumValues);
