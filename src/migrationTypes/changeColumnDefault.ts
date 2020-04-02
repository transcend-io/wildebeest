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
  oldDefault: string | null;
  /** The new default value */
  newDefault: string | null;
};

/**
 * Set the default value for a given column
 *
 * @param tableName - The table to change default for
 * @param columnName - The column to change default for
 * @param defaultValue - The default value to change to
 * @param transactionOptions - The transaction options
 */
export async function setColumnDefault<TModels extends ModelMap>(
  tableName: string,
  columnName: string,
  defaultValue: string,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  await transactionOptions.queryT.raw(
    `ALTER TABLE "${tableName}" ALTER "${columnName}" SET DEFAULT '${defaultValue}';`,
  );
}

/**
 * Drops the default value for a given column
 *
 * @param tableName - The table to change default for
 * @param columnName - The column to change default for
 * @param defaultValue - The default value to change to
 * @param transactionOptions - The transaction options
 */
export async function dropColumnDefault<TModels extends ModelMap>(
  tableName: string,
  columnName: string,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  await transactionOptions.queryT.raw(
    `ALTER TABLE "${tableName}" ALTER "${columnName}" DROP DEFAULT;`,
  );
}

/**
 * Changes or drops the default value for a given column
 *
 * @param tableName - The table to change default for
 * @param columnName - The column to change default for
 * @param defaultValue - The default value to change to
 * @param transactionOptions - The transaction options
 */
export async function changeDefaultValue<TModels extends ModelMap>(
  tableName: string,
  columnName: string,
  defaultValue: string | null,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  if (defaultValue === null) {
    await dropColumnDefault(tableName, columnName, transactionOptions);
  } else {
    await setColumnDefault(
      tableName,
      columnName,
      defaultValue,
      transactionOptions,
    );
  }
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
    // Change or drop the default value
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeDefaultValue(
          tableName,
          columnName,
          newDefault,
          transactionOptions,
        ),
      ),
    // Change or add back the default value
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
