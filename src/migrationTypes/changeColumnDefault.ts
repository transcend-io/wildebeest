// global
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';

/**
 * Options for changing the default value of a column
 */
export type ChangeColumnDefaultOptions = {
  /** The name of the table to change the default for */
  tableName: string;
  /** The name of the column to change */
  columnName: string;
  /** The old default value */
  oldDefault: string;
  /** The new default value */
  newDefault: string;
};

/**
 * Add a new version of the api
 *
 * @param tableName - The table to change default for
 * @param columnName - The column to change default for
 * @param defaultValue - The default value to change to
 * @param transactionOptions - The transaction options
 * @param db - The database to operate on
 */
export async function changeDefaultValue<TModels extends ModelMap>(
  tableName: string,
  columnName: string,
  defaultValue: string,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Add the enum values to the column
  await transactionOptions.queryT.raw(
    `ALTER TABLE "${tableName}" ALTER "${columnName}" SET DEFAULT '${defaultValue}';`,
  );
}

/**
 * Change default of column
 *
 * @param options - Options for changing the default
 * @returns The migrator
 */
export default function newApiVersion<TModels extends ModelMap>(
  options: ChangeColumnDefaultOptions,
): MigrationDefinition<TModels> {
  const { tableName, columnName, oldDefault, newDefault } = options;
  return {
    // Add the unique index
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeDefaultValue(
          tableName,
          columnName,
          newDefault,
          transactionOptions,
        ),
      ),
    // Remove the index
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeDefaultValue(
          tableName,
          columnName,
          oldDefault,
          transactionOptions,
        ),
      ),
  };
}
