// external modules
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';
import {
  invert,
  listEnumAttributes,
  migrateEnumValues,
} from '@wildebeest/utils';

/**
 * A migration that should run on the db
 */
export type ConvertEnumValuesOptions = {
  [tableName in string]: {
    [columnName in string]: { [oldValue in string]: string };
  };
};

/**
 * Rename enum values in a column
 *
 * @param wildebeest - The wildebeest configuration
 * @param tableName - The name of the table to rename the column in
 * @param columnName - The name of the column to rename
 * @param renameValues - The enum value maps to rename
 * @param transactionOptions - The current transaction
 */
export async function renameColumnEnumValues<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  tableName: string,
  columnName: string,
  renameValues: { [oldValue in string]: string },
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const name = wildebeest.namingConventions.enum(tableName, columnName);

  const newValues = Object.values(renameValues);
  const oldValues = Object.keys(renameValues);

  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    wildebeest.db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  let keepEnumValues = difference(existingEnumValues, oldValues);

  // Add on the new value
  keepEnumValues = keepEnumValues.concat(newValues);

  // Migrate the enum values and convert
  await migrateEnumValues(
    wildebeest,
    keepEnumValues,
    {
      tableName,
      columnName,
      // Convert from old value to new
      convertEnum: renameValues,
    },
    transactionOptions,
  );
}

/**
 * Rename many enum values in many tables
 * @param options - The enum values to rename
 */
export async function renameManyEnumValues<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: ConvertEnumValuesOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
  invertValues = false,
): Promise<void> {
  const changePromises = Object.entries(options).map(([tableName, columns]) =>
    Object.entries(columns).map(([columnName, column]) =>
      renameColumnEnumValues(
        wildebeest,
        tableName,
        columnName,
        invertValues ? invert(column) : column,
        transactionOptions,
      ),
    ),
  );

  await Promise.all(flatten(changePromises));
}

/**
 * A helper to batch convert enum values
 *
 * @memberof module:migrationTypes
 *
 * @param options - The convertEnumValues options
 * @returns The custom migrator
 */
export default function convertEnumValues<TModels extends ModelMap>(
  options: ConvertEnumValuesOptions,
): MigrationDefinition<TModels> {
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameManyEnumValues(wildebeest, options, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameManyEnumValues(wildebeest, options, transactionOptions, true),
      ),
  };
}
