// wildebeest
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';
import { listIndexNames } from '@wildebeest/utils';

// local
import { renameTableIndex } from './renameIndex';

/**
 * Rename column in a table options
 */
export type RenameColumnOptions = {
  /** The name of the table to rename the column in */
  tableName: string;
  /** The old name of the column */
  oldName: string;
  /** The name name of the column */
  newName: string;
  /** Also rename constraints (default is true) */
  renameConstraints?: boolean;
};

/**
 * Rename a column and optionally its constraints as well
 * @param db - The db to migrate
 * @param options - The rename options
 * @param transactionOptions - The transaction options
 */
export async function renameColumnAndConstraints(
  db: SequelizeMigrator,
  options: RenameColumnOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  const { tableName, oldName, newName, renameConstraints } = options;

  // Change the name
  await db.queryInterface.renameColumn(
    tableName,
    oldName,
    newName,
    transactionOptions,
  );

  // Rename constraints related to column
  if (renameConstraints) {
    const indexNames = await listIndexNames(db, tableName);
    await indexNames
      .filter((indexName) => indexName.includes(`_${oldName}_`))
      .map((indexName) =>
        renameTableIndex(
          {
            oldName: indexName,
            newName: indexName.replace(`_${oldName}_`, `_${newName}_`),
          },
          transactionOptions,
        ),
      );
  }
}

/**
 * Create a migration definition that renames a column
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for renaming a table column
 * @returns The rename column migrator migrator
 */
export default function renameColumn(
  options: RenameColumnOptions,
): MigrationDefinition {
  const { oldName, newName, ...rest } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameColumnAndConstraints(
          db,
          {
            oldName,
            newName,
            ...rest,
          },
          transactionOptions,
        ),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameColumnAndConstraints(
          db,
          {
            newName: oldName,
            oldName: newName,
            ...rest,
          },
          transactionOptions,
        ),
      ),
  };
}
