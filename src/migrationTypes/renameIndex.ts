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
 * @param options - The rename options
 * @param rawTransactionOptions - The existing transaction
 * @returns The rename table promise
 */
export async function renameTableIndex(
  { oldName, newName }: RenameIndexOptions,
  { queryT }: MigrationTransactionOptions,
): Promise<void> {
  await queryT.raw(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`);
}

/**
 * Rename an index
 *
 * @memberof module:migrationTypes
 *
 * @param options - Rename index options
 * @returns The rename index migrator
 */
export default function renameIndex(
  options: RenameIndexOptions,
): MigrationDefinition {
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        renameTableIndex(options, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
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
