// external
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

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
 * @param wildebeest - The wildebeest configuration
 * @param name - The name of the enum
 * @param attributes - The enum attributes to add
 * @param transactionOptions - The raw transaction options
 * @returns The change enum promise
 */
export async function addValuesToEnum<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: ChangeEnumAttributeOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { name, tableName, columnName, attributes } = options;

  // Get the existing enum values
  const existingEnumValues = await listEnumAttributes(
    wildebeest.db,
    name,
    transactionOptions,
  );

  // Determine the enum values to keep
  const newEnumValues = uniq(existingEnumValues.concat(attributes));

  // Migrate the enum values
  await migrateEnumValues(
    wildebeest,
    newEnumValues,
    { tableName, columnName },
    transactionOptions,
  );
}

/**
 * Remove attributes from an enum
 *
 * @param wildebeest - The wildebeest configuration
 * @param options - The change enum attribute options
 * @param transactionOptions - The current transaction options
 * @returns The change enum promise
 */
export async function removeValuesFromEnum<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: ChangeEnumAttributeOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
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
    wildebeest.db,
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
    wildebeest,
    newEnumValues,
    { tableName, columnName, convertEnum },
    transactionOptions,
  );
}

/**
 * Add values to an existing enum
 *
 * @param options - Options for adding attributes from the enum
 * @returns The add enum values migrator
 */
export default function addEnumValues<TModels extends ModelMap>(
  options: ChangeEnumAttributeOptions,
): MigrationDefinition<TModels> {
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        addValuesToEnum(wildebeest, options, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        removeValuesFromEnum(wildebeest, options, transactionOptions),
      ),
  };
}
