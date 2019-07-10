// wildebeest
import {
  Attributes,
  DefineColumns,
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';
import { addTableColumnConstraint, dropEnum, isEnum } from '@wildebeest/utils';
import { RawConstraint } from '@wildebeest/utils/indexConstraints';
import Wildebeest from '@wildebeest';

/**
 * Options for dropping a table
 */
export type DropTableOptions = {
  /** The name of the table to drop */
  tableName: string;
  /** A function that returns the column definitions for the new table */
  getColumns?: DefineColumns;
};

/**
 * Options for creating a new table
 */
export type CreateTableOptions = {
  /** The name of the table to create */
  tableName: string;
  /** A function that returns the column definitions for the new table */
  getColumns: DefineColumns;
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
export async function createNewTable(
  wildebeest: Wildebeest,
  options: CreateTableOptions,
  transactionOptions: MigrationTransactionOptions,
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
export async function dropTable(
  { db, namingConventions }: Wildebeest,
  options: DropTableOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  // Raw query interface
  const { queryInterface } = db;
  const { tableName, getColumns = () => ({}) } = options;

  // Drop the table first
  await queryInterface.dropTable(tableName, transactionOptions);

  // Find enum columns
  await Promise.all(
    Object.entries(getColumns(db))
      .filter(([, value]) => isEnum(value))
      // Drop the enums
      .map(([columnName]) =>
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
export default function createTable(
  options: CreateTableOptions,
): MigrationDefinition {
  const {
    tableName,
    getColumns,
    constraints = [],
    noDefaults = false,
  } = options;
  // Get the default columns for all models (can be skipped with `noDefaults`)
  const getDefaults = noDefaults
    ? () => ({})
    : ({ DataTypes }: SequelizeMigrator) => ({
        // UUID
        id: {
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          type: DataTypes.UUID,
        },
        // Created at time
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        // Updated at time
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      });

  // Get default columns combined with provided columns
  const getAllColumns = (db: SequelizeMigrator): Attributes =>
    Object.assign(getDefaults(db), getColumns(db));

  return {
    // Create a new table
    up: async (wildebeest, withTransaction) =>
      withTransaction(async (transactionOptions) =>
        createNewTable(
          wildebeest,
          { tableName, getColumns: getAllColumns, constraints },
          transactionOptions,
        ),
      ),
    // Drop the table
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        dropTable(
          wildebeest,
          { tableName, getColumns: getAllColumns },
          transactionOptions,
        ),
      ),
  };
}
