// global
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
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
 * @param db - The database to migrate against
 * @param options - The change enum options
 * @param rawTransactionOptions - The raw transaction options
 * @returns The change name promise
 */
export async function changeEnumName(
  db: SequelizeMigrator,
  options: RenameEnumOptions,
  transactionOptions: MigrationTransactionOptions,
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
 * @memberof module:migrationTypes
 *
 * @param options - The change enum options
 * @returns The rename enum migrator
 */
export default function renameEnum(
  options: RenameEnumOptions,
): MigrationDefinition {
  const { oldName, newName } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeEnumName(wildebeest.db, { oldName, newName }, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeEnumName(
          wildebeest.db,
          { newName: oldName, oldName: newName },
          transactionOptions,
        ),
      ),
  };
}
