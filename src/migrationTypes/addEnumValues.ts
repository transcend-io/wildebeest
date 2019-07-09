// external modules
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

// wildebeest
import listEnumAttributes from '@wildebeest/helpers/listEnumAttributes';
import migrateEnumValues from '@wildebeest/helpers/migrateEnumValues';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * Options for adding or removing enum values
 */
export type ChangeEnumAttributeOptions = {
  /** The name of the enum */
  name: string;
  /** The attributes to add or remove */
  attributes: string[];
  /** The table to modify */
  tableName: string;
  /** The column the enum belongs to */
  columnName: string;
  /** Whether to drop all values before removing on down migration only */
  drop?: boolean;
  /** A key->value mapping to convert on down migration only */
  convertEnum?: { [key in string]: string };
};

/**
 * Add attributes to an enum
 *
 * @param db - The database to migrate against
 * @param name - The name of the enum
 * @param attributes - The enum attributes to add
 * @param transactionOptions - The raw transaction options
 * @returns The change enum promise
 */
export async function addValuesToEnum(
  db: SequelizeMigrator,
  options: ChangeEnumAttributeOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  // Raw query interface
  const { name, tableName, columnName, attributes } = options;

  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  const newEnumValues = uniq(existingEnumValues.concat(attributes));

  // Migrate the enum values
  await migrateEnumValues(
    db,
    newEnumValues,
    { tableName, columnName },
    transactionOptions,
  );
}

/**
 * Remove attributes from an enum
 *
 * @param db - The db to migrate against
 * @param options - The change enum attribute options
 * @param transactionOptions - The current transaction options
 * @returns The change enum promise
 */
export async function removeValuesFromEnum(
  db: SequelizeMigrator,
  options: ChangeEnumAttributeOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  const {
    name,
    attributes,
    tableName,
    columnName,
    convertEnum,
    drop = false,
  } = options;
  // Raw query interface
  const { queryT } = transactionOptions;

  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  const newEnumValues = difference(existingEnumValues, attributes);

  // Drop the table rows if specified
  if (drop) {
    await queryT.delete(tableName, {
      [columnName]: attributes,
    });
  }

  // Migrate the enum values
  await migrateEnumValues(
    db,
    newEnumValues,
    { tableName, columnName, convertEnum },
    transactionOptions,
  );
}

/**
 * Add values to an existing enum
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for adding attributes from the enum
 * @returns The add enum values migrator
 */
export default function addEnumValues(
  options: ChangeEnumAttributeOptions,
): MigrationDefinition {
  return {
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        addValuesToEnum(db, options, transactionOptions),
      ),
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        removeValuesFromEnum(db, options, transactionOptions),
      ),
  };
}
