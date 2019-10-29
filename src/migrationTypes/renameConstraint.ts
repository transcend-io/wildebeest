// global
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';

/**
 * Options for changing the name of a constraint
 */
export type RenameConstraintOptions = {
  /** The name of the table to rename the constraint on */
  tableName: string;
  /** The old name of the constraint */
  oldName: string;
  /** The new name of the constraint */
  newName: string;
  /** If the oldName does not exist, simply skip this transformation (for backwards compatibility of migrations) */
  skipIfNotExists?: boolean;
};

/**
 * Change the name of a constraint
 *
 * @param db - The database to migrate against
 * @param options - The options to use to rename from
 * @param rawTransactionOptions - The previous transaction options
 * @returns The change constraint promise
 */
export async function changeConstraintName<TModels extends ModelMap>(
  options: RenameConstraintOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { queryT } = transactionOptions;
  const { tableName, oldName, newName, skipIfNotExists } = options;

  // Rename the constraint
  await queryT.raw(
    `
    ALTER TABLE ${
      skipIfNotExists ? 'IF EXISTS' : ''
    } "${tableName}" RENAME CONSTRAINT "${oldName}" TO "${newName}";
  `,
  );
}

/**
 * Change the name of a constraint
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for renaming a constraint
 * @returns The rename constraint migrator
 */
export default function renameConstraint<TModels extends ModelMap>(
  options: RenameConstraintOptions,
): MigrationDefinition<TModels> {
  const { oldName, newName, ...rest } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeConstraintName({ oldName, newName, ...rest }, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeConstraintName(
          { newName: oldName, oldName: newName, ...rest },
          transactionOptions,
        ),
      ),
  };
}
