// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
} from '@wildebeest/types';

/**
 * Some queries expect the primary key column to be called id TODO factor this out
 */
export type RowWithId = {
  /** Id of column in primary key */
  id: string | number;
};

/**
 * Input for changing null status migrator
 */
export type MakeColumnNonNullOptions<
  T extends RowWithId,
  TValue extends string | number | null
> = {
  /** The name of the table to modify */
  tableName: string;
  /** The name of the column to make non null */
  columnName: string;
  /** Get the row default value */
  getRowDefault?: (
    row: T,
    transactionOptions: MigrationTransactionOptions,
    db: WildebeestDb,
  ) => Promise<TValue>;
  /** When true, drop all null rows */
  drop?: boolean;
};

/**
 * Make a column non null
 *
 * @param options - The table column identifiers
 * @returns The make column non null migrator
 */
export default function makeColumnNonNull<
  T extends RowWithId,
  TValue extends string | number | null
>(options: MakeColumnNonNullOptions<T, TValue>): MigrationDefinition {
  const { tableName, columnName, getRowDefault, drop = false } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction(async (transactionOptions) => {
        const { queryT } = transactionOptions;
        // Convert null rows first
        if (getRowDefault) {
          await queryT.batchProcess<T>(
            tableName,
            { where: `"${columnName}" IS NULL` },
            async (row) => {
              // Get the new value
              const value = await Promise.resolve(
                getRowDefault(row, transactionOptions, wildebeest.db),
              );

              // Update by id
              await queryT.raw(
                `
            UPDATE "${tableName}"
            SET "${columnName}"='${value}'
            WHERE "id"='${row.id}';
          `,
              );
            },
          );

          // TODO temp workaround since above does not work????
          const stillNulls = await queryT.select(
            `SELECT * FROM "${tableName}" WHERE "${columnName}" IS NULL`,
          );
          await stillNulls.map(async (row) =>
            queryT.raw(
              `
            UPDATE "${tableName}"
            SET "${columnName}"='${await Promise.resolve(
                getRowDefault(row, transactionOptions, wildebeest.db),
              )}'
            WHERE "id"='${row.id}';
          `,
            ),
          );
          // TODO
        }

        // Drop null rows
        if (drop) {
          await queryT.delete(tableName, { [columnName]: null });
        }

        // Make column non null
        await queryT.raw(
          `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" SET not null;`,
        );
      }),
    down: async (_, withTransaction) =>
      withTransaction(({ queryT }) =>
        queryT.raw(
          `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP not null;`,
        ),
      ),
  };
}
