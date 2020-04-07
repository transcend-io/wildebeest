// external
import difference from 'lodash/difference';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';
import listEnumAttributes from '@wildebeest/utils/listEnumAttributes';
import migrateEnumValues from '@wildebeest/utils/migrateEnumValues';

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
 * @param wildebeest - The wildebeest config
 * @param options - The rename table options
 * @param rawTransactionOptions - The existing transaction
 * @returns The rename table promise
 */
export async function renameValueOfEnum<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: RenameEnumValueOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const { name, tableName, columnName, oldValue, newValue } = options;
  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    wildebeest.db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  const keepEnumValues = difference(existingEnumValues, [oldValue]);

  // Add on the new value
  keepEnumValues.push(newValue);

  // Migrate the enum values and convert
  await migrateEnumValues(
    wildebeest,
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
 * @param options - The rename enum value options
 * @returns The rename enum value migrator
 */
export default function renameEnumValue<TModels extends ModelMap>(
  options: RenameEnumValueOptions,
): MigrationDefinition<TModels> {
  const { oldValue, newValue, ...rest } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameValueOfEnum(
          wildebeest,
          { oldValue, newValue, ...rest },
          transactionOptions,
        ),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameValueOfEnum(
          wildebeest,
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
