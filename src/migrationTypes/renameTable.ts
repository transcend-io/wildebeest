// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';
import { listConstraintNames, listIndexNames } from '@wildebeest/utils';

// local
import { changeConstraintName } from './renameConstraint';
import { renameTableIndex } from './renameIndex';

/**
 * Options for renaming a table and associated indices
 */
export type RenameTableOptions = {
  /** The old name of the table */
  oldName: string;
  /** The new name of the table */
  newName: string;
  /** Rename all constraints as well */
  renameConstraints?: boolean;
  /** Drop the rows before altering the table */
  drop?: boolean;
};

/**
 * Rename a table and related indices
 *
 * @param db - The db to migrate
 * @param options - The rename table options
 * @param rawTransactionOptions - The existing transaction
 * @returns The rename table promise
 */
export async function changeTableName<TModels extends ModelMap>(
  { db }: Wildebeest<TModels>,
  options: RenameTableOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const { oldName, newName, renameConstraints = false, drop = false } = options;
  const { queryT } = transactionOptions;
  // Raw query interface
  const { queryInterface } = db;

  // Drop the rows if specified
  if (drop) {
    await queryT.delete(oldName, {});
  }

  // Rename the table
  await queryInterface.renameTable(oldName, newName, transactionOptions);

  // Rename all constraints that have the table name in the constraint name
  if (renameConstraints) {
    const constraints = await listConstraintNames(
      db,
      newName,
      transactionOptions,
    );
    await Promise.all(
      constraints.map((constraintNAme) =>
        changeConstraintName(
          {
            oldName: constraintNAme,
            newName: constraintNAme.replace(`${oldName}_`, `${newName}_`),
            tableName: newName,
            skipIfExists: true,
          },
          transactionOptions,
          db,
        ),
      ),
    );

    //  Determine the indexes
    const indexes = await listIndexNames(db, newName, transactionOptions);
    await Promise.all(
      indexes
        .filter((indexName) => indexName.startsWith(`${oldName}_`))
        .map((indexName) =>
          renameTableIndex(
            {
              oldName: indexName,
              newName: indexName.replace(`${oldName}_`, `${newName}_`),
            },
            transactionOptions,
          ),
        ),
    );
  }
}

/**
 * Create a migrator that will rename a table and all associated indices
 *
 * @param options - The options for renaming a table
 * @returns The rename table migrator
 */
export default function renameTable<TModels extends ModelMap>(
  options: RenameTableOptions,
): MigrationDefinition<TModels> {
  const { oldName, newName, ...rest } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeTableName(
          wildebeest,
          { oldName, newName, ...rest },
          transactionOptions,
        ),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeTableName(
          wildebeest,
          {
            oldName: newName,
            newName: oldName,
            ...rest,
          },
          transactionOptions,
        ),
      ),
  };
}
