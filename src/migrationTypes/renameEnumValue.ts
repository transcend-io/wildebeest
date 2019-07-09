// external modules
import difference from 'lodash/difference';

// wildebeest
import listEnumAttributes from '@wildebeest/helpers/listEnumAttributes';
import migrateEnumValues from '@wildebeest/helpers/migrateEnumValues';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator
} from '@wildebeest/types';

/**
 * Input for renaming the value of a sequelize enum
 */
export type RenameEnumValueOptions = {
  /** The name of the enum to rename the value */
  name: string;
  /** The name of the table where the enum exists */
  tableName: string;
  /** The name of the column where the enum is defined */
  columnName: string;
  /** The old value of the enum */
  oldValue: string;
  /** The new value of the enum */
  newValue: string;
};

/**
 * Rename an index
 *
 * @param db - The db to migrate
 * @param options - The rename table options
 * @param rawTransactionOptions - The existing transaction
 * @returns The rename table promise
 */
export async function renameValueOfEnum(
  db: SequelizeMigrator,
  options: RenameEnumValueOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  const { name, tableName, columnName, oldValue, newValue } = options;
  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  const keepEnumValues = difference(existingEnumValues, [oldValue]);

  // Add on the new value
  keepEnumValues.push(newValue);

  // Migrate the enum values and convert
  await migrateEnumValues(
    db,
    keepEnumValues,
    {
      tableName,
      columnName,
      // Convert from old value to new
      convertEnum: { [oldValue]: newValue },
    },
    transactionOptions,
  );
}

/**
 * Rename an existing enum value
 *
 * @memberof module:migrationTypes
 *
 * @param options - The rename enum value options
 * @returns The rename enum value migrator
 */
export default function renameEnumValue(
  options: RenameEnumValueOptions,
): MigrationDefinition {
  const { oldValue, newValue, ...rest } = options;
  return {
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameValueOfEnum(
          db,
          { oldValue, newValue, ...rest },
          transactionOptions,
        ),
      ),
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameValueOfEnum(
          db,
          {
            newValue: oldValue,
            oldValue: newValue,
            ...rest,
          },
          transactionOptions,
        ),
      ),
  };
}
