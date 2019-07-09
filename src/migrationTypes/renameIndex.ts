// wildebeest
import {
  MigrationDefinition,
  MigrationTransactionOptions,
} from '@wildebeest/types';

/**
 * The options for renaming a table index
 */
export type RenameIndexOptions = {
  /** The old name of the index */
  oldName: string;
  /** The new name of the index */
  newName: string;
};

/**
 * Rename an index
 *
 * @param db - The database to migrate
 * @param options - The rename options
 * @param rawTransactionOptions - The existing transaction
 * @returns The rename table promise
 */
export async function renameTableIndex(
  options: RenameIndexOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  await transactionOptions.queryT.raw(
    `ALTER INDEX "${options.oldName}" RENAME TO "${options.newName}"`,
  );
}

/**
 * Rename an index
 *
 * @memberof module:migrationTypes
 *
 * @param {string}  options.oldName - The old name of the index
 * @param {string}  options.newName - The new name of the index
 * @returns The rename index migrator
 */
export default function renameIndex(
  options: RenameIndexOptions,
): MigrationDefinition {
  return {
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameTableIndex(options, transactionOptions),
      ),
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameTableIndex(
          {
            newName: options.oldName,
            oldName: options.newName,
          },
          transactionOptions,
        ),
      ),
  };
}
