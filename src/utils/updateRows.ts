// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import {
  AttributeInputs,
  Attributes,
  ExtractRequiredAttributes,
  Identity,
  MigrationTransactionOptions,
  ModelMap,
  SubNotType,
} from '@wildebeest/types';
import getKeys from '@wildebeest/utils/getKeys';

// local
import batchProcess, { WhereOptions } from './batchProcess';

/**
 * Take the attribute definitions and extract out the typings that should be assigned to the db model
 *
 * TODO actually enforce this in migrationTypes for column mappers and ensure mapper is provided when there are required values
 */
export type ExtractUpdateAttributes<TAttributes extends Attributes> = Identity<
  ExtractRequiredAttributes<
    SubNotType<
      TAttributes,
      | {
          /** If null values are allowed, we do not need to create a mapping */
          allowNull: true;
        }
      | {
          /** If null values are allowed, we do not need to create a mapping */
          defaultValue: any; // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      | {
          /** If null values are allowed, we do not need to create a mapping */
          autoIncrement: true;
        }
    >
  > &
    Partial<ExtractRequiredAttributes<TAttributes>>
>;

/**
 * Database column definitions, often found in attributes.js
 */
export type RowUpdater<
  TModels extends ModelMap,
  TAttributes extends Attributes
> = (
  row: AttributeInputs,
  transactionOptions: MigrationTransactionOptions<TModels, TAttributes>,
  db: WildebeestDb<TModels>,
) =>
  | ExtractUpdateAttributes<TAttributes>
  | PromiseLike<ExtractUpdateAttributes<TAttributes>>;

/**
 * Extra options that can be provided when updating values in a table
 */
export type UpdateRowOptions = {
  /** The name of the primary key column in the table */
  idName?: string; // Extract<keyof T, string>;
  /** What to set for columns when no default is provided */
  onNullValue?: (dv: any) => any; // TODO remove
};

/**
 * Update existing rows with new calculated values
 *
 * @param wildebeest - The wildebeest configuration
 * @param tableName - The name of the table to operate on
 * @param getRowDefaults - The function to apply to each row to get the default values
 * @param columnDefinitions - The column definitions to update
 * @param options - Extra options for determining defaults
 * @param queryT - Helper functions to run updates in a transaction
 * @param rawTransactionOptions - The current transaction if one exists
 * @returns The number of rows operate on
 */
export default async function updateRows<
  T extends {},
  TModels extends ModelMap,
  TAttributes extends Attributes
>(
  wildebeest: Wildebeest<TModels>,
  tableName: string,
  getRowDefaults: RowUpdater<TModels, TAttributes>,
  columnDefinitions: TAttributes,
  options: UpdateRowOptions = {},
  transactionOptions: MigrationTransactionOptions<TModels, TAttributes>,
  batchProcessOptions: WhereOptions = {
    attributes: '*',
    orderBy: options.idName || 'id',
  },
): Promise<number> {
  const { queryT } = transactionOptions;
  const { onNullValue, idName = 'id' } = options;

  // Update rows in batches
  return batchProcess<T, TModels, TAttributes>(
    wildebeest,
    tableName,
    batchProcessOptions,
    async (row) => {
      // Get the default values to update in the table
      const defaultValues: any = await getRowDefaults(
        row,
        transactionOptions,
        wildebeest.db,
      );

      // Ensure each column is defined
      getKeys(columnDefinitions)
        // Find columns that are not defined
        .filter(
          (columnName) =>
            defaultValues[columnName as keyof T] === null ||
            defaultValues[columnName as keyof T] === undefined,
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
          `UPDATE "${tableName}" SET ${setOptions} WHERE "${idName}"='${
            row[idName as keyof T]
          }'`,
        );
      }
    },
    transactionOptions,
  );
}
