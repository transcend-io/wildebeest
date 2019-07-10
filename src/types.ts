/**
 *
 * ## Migrations Type Definitions
 * Type definitions for the migrations container.
 *
 * @module migrations/types
 * @see module:migrations
 */

// external modules
import * as sequelize from 'sequelize';

// local
import Wildebeest from './index';
import { WhereOptions } from './utils/batchProcess';
import { WithTransaction } from './utils/createQueryMaker';
import { RowUpdater, UpdateRowOptions } from './utils/updateRows';
import mkEnum from './utils/mkEnum';

/**
 * Any array
 */
type AnyArray = any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Foreign key constraint definition for a table column
 */
export type SequelizeMigrator = sequelize.Sequelize & {
  /** No need to call getter to access queryInterface during migrations */
  queryInterface: sequelize.QueryInterface;
  /** The data types */
  DataTypes: typeof sequelize.DataTypes;
};

/**
 * A migration that should run on the db
 */
export type MigrationDefinition = {
  /** The up migration (there should be no loss of data) */
  up: (db: Wildebeest, withTransaction: WithTransaction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (db: Wildebeest, withTransaction: WithTransaction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
};

/**
 * A db model column attribute, adds some extra configs for associations
 */
export type Attribute = sequelize.ModelAttributeColumnOptions & {
  /** Indicates if the column definition is due to an association */
  isAssociation?: boolean;
  /** The association options */
  associationOptions?: sequelize.AssociationOptions;
};

/**
 * The db model column definitions
 */
export type Attributes = { [key in string]: Attribute };

/** Function that returns column definition where key is column name and value is column definition */
/**
 * Function that returns column definition where key is column name and value is column definition
 */
export type DefineColumns = (db: SequelizeMigrator) => Attributes;

/**
 * A definition of a database model
 */
export type ModelDefinition = {
  /** The name of the table */
  tableName: string;
  /** The sequelize db model attribute definitions */
  attributes: sequelize.ModelAttributes;
  /** The sequelize db model options */
  options: sequelize.ModelOptions;
};

/**
 * Run a query with a transaction
 */
export type QueryWithTransaction<T extends AnyArray = AnyArray> = (
  q: string,
) => PromiseLike<T>;

/**
 * The helper functions wrapped in transactions
 */
export type QueryHelpers<T extends {}, TInput extends {} = T> = {
  /** Run a SELECT query in the transaction that returns a list */
  select: QueryWithTransaction<T[]>;
  /** Delete rows inside the transaction */
  delete: (
    tableName: string,
    identifier?: sequelize.WhereOptions,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Insert rows inside the transaction */
  insert: (tableName: string, records: TInput[]) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** A raw SQL query returning metadata as well */
  raw: QueryWithTransaction<T[]>;
  /** Batch process in the same transaction */
  batchProcess: (
    tableName: string,
    whereOptions: WhereOptions,
    processRow: (row: T) => void,
  ) => Promise<number>;
  /** Batch update a table */
  batchUpdate: (
    tableName: string,
    getRowDefaults: RowUpdater<T>,
    columnDefinitions: Attributes,
    options: UpdateRowOptions<T>,
  ) => Promise<number>;
};

/**
 * Transaction options when running a migration come with helper functions
 */
export type MigrationTransactionOptions<T extends {} = {}> = {
  /** Helper functions that run within the migration transaction */
  queryT: QueryHelpers<T>;
  /** The transaction itself */
  transaction: sequelize.Transaction;
};

/**
 * A definition for a migration file
 */
export type MigrationConfig = {
  /** The migration count */
  numInt: number;
  /** The migration count as a string */
  num: string;
  /** The migration name with the count */
  name: string;
  /** The name of the file */
  fileName: string;
  /** The full path to the file */
  fullPath: string;
};

/**
 * The supported postgres index types
 */
export enum IndexType {
  /** An index on a primary key */
  PrimaryKey = 'primary key',
  /** A column or set of columns that are unique */
  Unique = 'unique',
  /** (default) A regular database index */
  Index = 'index',
}

/**
 * Input for creating an index
 */
export type IndexConfig = {
  /** The type of index */
  type: IndexType;
  /** The name of the index */
  name: string;
};

/**
 * The supported postgres index methods
 */
export enum IndexMethod {
  /** A binary tree index */
  BTree = 'BTREE',
  /** A hash index */
  Hash = 'HASH',
  /** Gist index */
  Gist = 'GIST',
  /** Gin index */
  Gin = 'GIN',
  /** Sp gist index */
  SPGist = 'SPGIST',
  /** Brin index */
  Brin = 'BRIN',
}

/**
 * Possible options on association model delete
 */
export const OnDelete = mkEnum({
  /** Cascade the deletion to this table */
  Cascade: 'CASCADE',
  /** Set the column to null */
  SetNull: 'SET NULL',
  /** Do nothing (often not used) */
  NoAction: 'NO ACTION',
});

/**
 * Overload with type of on delete
 */
export type OnDelete = (typeof OnDelete)[keyof typeof OnDelete];
