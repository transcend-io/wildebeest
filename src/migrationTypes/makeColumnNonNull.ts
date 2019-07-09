// wildebeest
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * Input for changing null status migrator
 */
export type MakeColumnNonNullOptions<T, D> = {
  /** The name of the table to modify */
  tableName: string;
  /** The name of the column to make non null */
  columnName: string;
  /** Get the row default value */
  getRowDefault?: (
    row: T,
    transactionOptions: MigrationTransactionOptions,
    db: SequelizeMigrator,
  ) => Promise<D>;
  /** When true, drop all null rows */
  drop?: boolean;
};

/**
 * Make a column non null
 *
 * @memberof module:migrationTypes
 *
 * @param options - The table column identifiers
 * @returns The make column non null migrator
 */
export default function makeColumnNonNull<T, D>(
  options: MakeColumnNonNullOptions<T, D>,
): MigrationDefinition {
  const { tableName, columnName, getRowDefault, drop = false } = options;
  return {
    up: async (db, withTransaction) =>
      withTransaction(async (transactionOptions) => {
        const { queryT } = transactionOptions;
        // Convert null rows first
        if (getRowDefault) {
          await queryT.batchProcess(
            tableName,
            { where: `"${columnName}" IS NULL` },
            async (row) => {
              // Get the new value
              const value = await Promise.resolve(
                getRowDefault(row, transactionOptions, db),
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
    down: async (db, withTransaction) =>
      withTransaction(({ queryT }) =>
        queryT.raw(
          `ALTER TABLE "${tableName}" ALTER COLUMN "${columnName}" DROP not null;`,
        ),
      ),
  };
}
