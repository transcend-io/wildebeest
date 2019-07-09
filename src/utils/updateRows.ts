// wildebeest
import {
  Attributes,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

// local
import batchProcess from './batchProcess';

/**
 * Database column definitions, often found in attributes.js
 */
export type RowUpdater<P, T> = (
  row: P,
  transactionOptions: MigrationTransactionOptions,
  db: SequelizeMigrator,
) => T | PromiseLike<T>;

/**
 * Extra options that can be provided when updating values in a table
 */
export type UpdateRowOptions = {
  /** The name of the primary key column in the table */
  idName?: string;
  /** What to set for columns when no default is provided */
  onNullValue?: (dv: any) => any; // TODO remove
};

/**
 * Update existing rows with new calculated values
 *
 * @param db - The sequelize db to migrate
 * @param tableName - The name of the table to operate on
 * @param getRowDefaults - The function to apply to each row to get the default values
 * @param columnDefinitions - The column definitions to update
 * @param options - Extra options for determining defaults
 * @param queryT - Helper functions to run updates in a transaction
 * @param rawTransactionOptions - The current transaction if one exists
 * @returns The number of rows operate on
 */
export default async function updateRows<P, T>(
  db: SequelizeMigrator,
  tableName: string,
  getRowDefaults: RowUpdater<P, T>,
  columnDefinitions: Attributes,
  options: UpdateRowOptions = {},
  transactionOptions: MigrationTransactionOptions,
): Promise<number> {
  const { queryT } = transactionOptions;
  const { onNullValue, idName = 'id' } = options;

  // Update rows in batches
  return batchProcess<P>(
    db,
    tableName,
    { attributes: '*' },
    async (row) => {
      // Get the default values to update in the table
      const defaultValues = await getRowDefaults(row, transactionOptions, db);

      // Ensure each column is defined
      Object.keys(columnDefinitions)
        // Find columns that are not defined
        .filter(
          (columnName) =>
            defaultValues[columnName] === null ||
            defaultValues[columnName] === undefined,
        )
        .forEach((columnName) => {
          const defaultValue = onNullValue
            ? onNullValue(columnDefinitions[columnName].defaultValue)
            : undefined;
          if (defaultValue !== undefined) {
            Object.assign(defaultValues, { [columnName]: defaultValue });
          }
        });

      // The update set SQL options
      const setOptions = Object.entries(defaultValues)
        .map(([columnName, value]) => `"${columnName}"='${value}'`)
        .join(', ');

      // Update the rows with the new defaults
      if (setOptions) {
        await queryT.raw(
          `UPDATE "${tableName}" SET ${setOptions} WHERE "${idName}"='${row[idName]}'`,
        );
      }
    },
    transactionOptions,
  );
}
