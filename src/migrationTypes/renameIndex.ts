// global
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
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
export async function renameTableIndex<TModels extends ModelMap>(
  { oldName, newName }: RenameIndexOptions,
  { queryT }: MigrationTransactionOptions<TModels>,
): Promise<void> {
  await queryT.raw(`ALTER INDEX "${oldName}" RENAME TO "${newName}"`);
}

/**
 * Rename an index
 *
 * @param options - Rename index options
 * @returns The rename index migrator
 */
export default function renameIndex<TModels extends ModelMap>(
  options: RenameIndexOptions,
): MigrationDefinition<TModels> {
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
