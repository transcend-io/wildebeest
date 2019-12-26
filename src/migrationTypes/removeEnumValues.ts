// migrators
import reverseMigrator from '@wildebeest/utils/reverseMigrator';

// local
import addEnumValues from './addEnumValues';

/**
 * Remove values from an enum on up, and add them back on down
 *
 * @param options - Options for removing attributes from the enum
 * @returns The remove enum values migrator
 */
export default reverseMigrator(addEnumValues);
