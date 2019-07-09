// wildebeest
import {
  IndexType,
  IndexConfig,
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';
import { listIndexNames } from '@wildebeest/utils';

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
  /** The constraints to rename */
  constraints?: string[];
  /** Rename all constraints as well */
  renameConstraints?: boolean;
  /** Drop the rows before altering the table */
  drop?: boolean;
};

/**
 * TODO
 */
export type Index = {
  /** The index name */
  name: string;
};

/**
 * Generate the default index name for a table/column pair
 *
 * @memberof module:db/helpers
 *
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The index configuration to use with queryInterface to create the index
 */
export function defaultColumnIndex(
  tableName: string,
  columnName: string,
): IndexConfig {
  // Determine the default name
  const name = defaultColumnIndexName(tableName, columnName);

  // Determine the configuration
  return columnName === 'id'
    ? { type: IndexType.PrimaryKey, name }
    : { type: IndexType.Unique, name };
}

/**
 * Rename a table and related indices
 *
 * @param db - The db to migrate
 * @param options - The rename table options
 * @param rawTransactionOptions - The existing transaction
 * @returns The rename table promise
 */
export async function changeTableName(
  db: SequelizeMigrator,
  options: RenameTableOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  const {
    oldName,
    newName,
    constraints = [],
    renameConstraints = false,
    drop = false,
  } = options;
  const { queryT } = transactionOptions;
  // Raw query interface
  const { queryInterface } = db;

  // Drop the rows if specified
  if (drop) {
    await queryT.delete(oldName, {});
  }

  // Rename the table
  await queryInterface.renameTable(oldName, newName, transactionOptions);

  // Rename the specified constraints
  await Promise.all(
    constraints.map((columnName) => {
      // Create the index configuration
      const oldConfig = (defaultColumnIndex(
        oldName,
        columnName,
      ) as unknown) as Index;
      const newConfig = (defaultColumnIndex(
        newName,
        columnName,
      ) as unknown) as Index;

      // Remove the old constraint and add new
      return changeConstraintName(
        {
          newName: newConfig.name,
          oldName: oldConfig.name,
          tableName: newName,
        },
        transactionOptions,
      );
    }),
  );

  // Rename all constraints that have the table name in the constraint name
  if (renameConstraints) {
    //  Determine the indexes
    const indexes = await listIndexNames(db, newName, transactionOptions);

    // Find and update the index names that contain the old name
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
 * @memberof module:migrationTypes
 *
 * @param options - The options for renaming a table
 * @returns The rename table migrator
 */
export default function renameTable(
  options: RenameTableOptions,
): MigrationDefinition {
  const { oldName, newName, ...rest } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeTableName(db, { oldName, newName, ...rest }, transactionOptions),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeTableName(
          db,
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
