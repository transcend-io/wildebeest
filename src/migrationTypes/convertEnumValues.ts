// external modules
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';

// wildebeest
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';
import {
  listEnumAttributes,
  migrateEnumValues,
  invert,
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
 * @param options - The enum values to rename
 */
export async function renameColumnEnumValues(
  tableName: string,
  columnName: string,
  renameValues: { [oldValue in string]: string },
  db: SequelizeMigrator,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  const name = defaultEnumName(tableName, columnName);

  const newValues = Object.values(renameValues);
  const oldValues = Object.keys(renameValues);

  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  let keepEnumValues = difference(existingEnumValues, oldValues);

  // Add on the new value
  keepEnumValues = keepEnumValues.concat(newValues);

  // Migrate the enum values and convert
  await migrateEnumValues(
    db,
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
export async function renameManyEnumValues(
  options: ConvertEnumValuesOptions,
  db: SequelizeMigrator,
  transactionOptions: MigrationTransactionOptions,
  invertValues = false,
): Promise<void> {
  const changePromises = Object.entries(options).map(([tableName, columns]) =>
    Object.entries(columns).map(([columnName, column]) =>
      renameColumnEnumValues(
        tableName,
        columnName,
        invertValues ? invert(column) : column,
        db,
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
export default function convertEnumValues(
  options: ConvertEnumValuesOptions,
): MigrationDefinition {
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameManyEnumValues(options, db, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameManyEnumValues(options, db, transactionOptions, true),
      ),
  };
}
