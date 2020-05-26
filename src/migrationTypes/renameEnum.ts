// global
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';

/**
 * The options for changing the name of an enum
 */
export type RenameEnumOptions = {
  /** The old name of the enum */
  oldName: string;
  /** The new name of the enum */
  newName: string;
};

/**
 * Change the name of an enum
 *
 * @param options - The change enum options
 * @param rawTransactionOptions - The raw transaction options
 * @returns The change name promise
 */
export async function changeEnumName<TModels extends ModelMap>(
  options: RenameEnumOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { queryT } = transactionOptions;

  // Change the name
  await queryT.raw(
    `ALTER TYPE "${options.oldName}" RENAME TO "${options.newName}"`,
  );
}

/**
 * Rename an enum definition
 *
 * @param options - The change enum options
 * @returns The rename enum migrator
 */
export default function renameEnum<TModels extends ModelMap>(
  options: RenameEnumOptions,
): MigrationDefinition<TModels> {
  const { oldName, newName } = options;
  return {
    up: async (_, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeEnumName({ oldName, newName }, transactionOptions),
      ),
    down: async (_, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeEnumName(
          { newName: oldName, oldName: newName },
          transactionOptions,
        ),
      ),
  };
}
