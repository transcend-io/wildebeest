// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import {
  Attributes,
  DefineColumns,
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';
import { addTableColumnConstraint, dropEnum, isEnum } from '@wildebeest/utils';
import { getStringKeys } from '@wildebeest/utils/getKeys';
import { RawConstraint } from '@wildebeest/utils/indexConstraints';

/**
 * Options for dropping a table
 */
export type DropTableOptions<
  TAttributes extends Attributes,
  TModels extends ModelMap
> = {
  /** The name of the table to drop */
  tableName: string;
  /** A function that returns the column definitions for the new table */
  getColumns?: DefineColumns<TModels, TAttributes>;
};

/**
 * Options for creating a new table
 */
export type CreateTableOptions<
  TAttributes extends Attributes,
  TModels extends ModelMap
> = {
  /** The name of the table to create */
  tableName: string;
  /** A function that returns the column definitions for the new table */
  getColumns: DefineColumns<TModels, TAttributes>;
  /** The columns that should get cascade constraints */
  constraints?: RawConstraint[];
  /** When true, the columns id, createdAt, and updatedAt will not be added in addition to columns from `getColumns` */
  noDefaults?: boolean;
};

/**
 * Create a new table and all associated pieces
 *
 * @param options - The options for creating the table
 * @returns The create table promise
 */
export async function createNewTable<
  TAttributes extends Attributes,
  TModels extends ModelMap
>(
  wildebeest: Wildebeest<TModels>,
  options: CreateTableOptions<TAttributes, TModels>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { queryInterface } = wildebeest.db;
  const { tableName, getColumns, constraints = [] } = options;

  // Create the table
  await queryInterface.createTable(
    tableName,
    getColumns(wildebeest.db),
    transactionOptions,
  );

  // Add the constraints if provided
  if (constraints) {
    // Add constraints for each column specified
    await Promise.all(
      constraints.map((constraintConfig) =>
        addTableColumnConstraint(
          wildebeest,
          {
            tableName,
            columnName:
              typeof constraintConfig === 'string'
                ? constraintConfig
                : constraintConfig.columnName,
            constraintOptions: {
              type: 'foreign key' as 'foreign key',
              onDelete: 'SET NULL',
              onUpdate: 'CASCADE',
              ...(typeof constraintConfig === 'string'
                ? {}
                : {
                    references: {
                      table: constraintConfig.tableName as string,
                      field: 'id',
                    },
                  }),
            },
          },
          transactionOptions,
        ),
      ),
    );
  }
}

/**
 * Remove a table from the db and all associated parts
 *
 * @param wildebeest - The wildebeest configuration
 * @param options - The table & column definitions
 * @param transactionOptions - The current transaction
 * @returns The remove table promise
 */
export async function dropTable<
  TAttributes extends Attributes,
  TModels extends ModelMap
>(
  wildebeest: Wildebeest<TModels>,
  options: DropTableOptions<TAttributes, TModels>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { db, namingConventions } = wildebeest;
  const { queryInterface } = db;
  const { tableName, getColumns = () => ({}) } = options;

  // Drop the table first
  await queryInterface.dropTable(tableName, transactionOptions);

  // Find enum columns
  const columns = getColumns(wildebeest.db);
  await Promise.all(
    getStringKeys(columns)
      .filter((columnName) => isEnum(columns[columnName]))
      // Drop the enums
      .map((columnName) =>
        dropEnum(
          db,
          namingConventions.enum(tableName, columnName),
          transactionOptions,
        ),
      ),
  );
}

/**
 * Create a migration definition that adds a new table on up, and removes the table on down
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for creating a new table
 * @returns The create table migrator
 */
export default function createTable<
  TAttributes extends Attributes,
  TModels extends ModelMap
>(
  options: CreateTableOptions<TAttributes, TModels>,
): MigrationDefinition<TModels> {
  const {
    tableName,
    getColumns,
    constraints = [],
    noDefaults = false,
  } = options;

  // Get default columns combined with provided columns
  const getAllColumns = (
    defaultAttributes: Attributes,
  ): ((db: WildebeestDb<TModels>) => Attributes) => (
    db: WildebeestDb<TModels>,
  ): Attributes => ({ ...defaultAttributes, ...getColumns(db) });

  return {
    // Create a new table
    up: async (wildebeest, withTransaction) =>
      withTransaction(async (transactionOptions) =>
        createNewTable(
          wildebeest,
          {
            tableName,
            getColumns: getAllColumns(
              noDefaults ? {} : wildebeest.defaultAttributes,
            ),
            constraints,
          },
          transactionOptions,
        ),
      ),
    // Drop the table
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        dropTable(
          wildebeest,
          {
            tableName,
            getColumns: getAllColumns(
              noDefaults ? {} : wildebeest.defaultAttributes,
            ),
          },
          transactionOptions,
        ),
      ),
  };
}
