// wildebeest
import { MigrationTransactionOptions, SequelizeMigrator } from '@wildebeest/types';

// local
import columnAllowsNull from './columnAllowsNull';
import getColumnDefault from './getColumnDefault';
import migrateEnumColumn, { MigrateEnumOptions } from './migrateEnumColumn';

/**
 * Lookup the current column attributes, and migrate the values of an enum by removing the old enum and adding a new enum.
 *
 * This is done to preserve proper non-superuser postgres admin privilege during migrations.
 *
 * @param {string}                                        tableName - The name of the table
 * @param {string}                                        columnName - The name of the column where enum is applied
 * @param {string[]}                                      enumValueList - The new enum values
 * @param {module:migrations/typeDefs~MigrateEnumOptions} [options={}] - Specify additional options to pass to migrateEnumColumn
 * @returns The change enum promise
 */
export default async function migrateEnumValues(
  db: SequelizeMigrator,
  enumValueList,
  migrateEnumOptions: MigrateEnumOptions,
  transactionOptions?: MigrationTransactionOptions,
): Promise<void> {
  const { tableName, columnName } = migrateEnumOptions;

  // Build the new enum values
  const enumValue = enumValueList.reduce(
    (acc, val) => Object.assign(acc, { [val]: val }),
    {},
  );

  // Keep the same allowNull and defaultValue
  const [allowNull, defaultValue] = await Promise.all([
    columnAllowsNull(db, tableName, columnName, transactionOptions),
    getColumnDefault(db, tableName, columnName, transactionOptions),
  ]);

  // Determine the new default value (it is either the existing defaultValue or the converted default value)
  const calculatedDefaultValue =
    defaultValue && defaultValue.includes('::')
      ? defaultValue
          .split('::')[0]
          .split("'")
          .join('')
      : '';

  // Check if the default value needs to be converted
  const { convertEnum = {} } = migrateEnumOptions;
  const convertedDefaultValue =
    convertEnum[calculatedDefaultValue] || calculatedDefaultValue;

  // Migrate the column
  await migrateEnumColumn(
    db,
    enumValue,
    {
      ...migrateEnumOptions,
      allowNull,
      defaultValue: convertedDefaultValue,
    },
    transactionOptions,
  );
}
