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

// db
import { Associations, Attributes, TransactionOptions } from '@bk/db/types';

// local
import { WhereOptions } from './helpers/batchProcess';
import { WithTransaction } from './helpers/createQueryMaker';
import { RowUpdater, UpdateRowOptions } from './helpers/updateRows';

/**
 * Any array
 */
export type AnyArray = any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

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
  up: (db: SequelizeMigrator, withTransaction: WithTransaction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (
    db: SequelizeMigrator,
    withTransaction: WithTransaction,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
};

/** Function that returns column definition where key is column name and value is column definition */
/**
 * Function that returns column definition where key is column name and value is column definition
 */
export type DefineColumns = (db: SequelizeMigrator) => Attributes;

/**
 * Run a query with a transaction
 */
export type QueryWithTransaction<T extends AnyArray = AnyArray> = (
  q: string,
) => PromiseLike<T>;

/**
 * The helper functions wrapped in transactions
 */
export type QueryHelpers<
  T extends AnyArray = AnyArray,
  PR = any,
  PU = any,
  TU = any
> = {
  /** Run a SELECT query in the transaction that returns a list */
  select: QueryWithTransaction<T>;
  /** Delete rows inside the transaction */
  delete: (
    tableName: string,
    identifier?: sequelize.WhereOptions,
  ) => Promise<any>;
  /** Insert rows inside the transaction */
  insert: (tableName: string, records: any[]) => Promise<any>;
  /** A raw SQL query returning metadata as well */
  raw: QueryWithTransaction<T>;
  /** Batch process in the same transaction */
  batchProcess: (
    tableName: string,
    whereOptions: WhereOptions,
    processRow: (row: PR) => void,
  ) => Promise<number>;
  /** Batch update a table */
  batchUpdate: (
    tableName: string,
    getRowDefaults: RowUpdater<PU, TU>,
    columnDefinitions: Associations,
    options: UpdateRowOptions,
  ) => Promise<number>;
};

/**
 * Transaction options when running a migration come with helper functions
 * // TODO pass typings of query helpers through
 */
export type MigrationTransactionOptions = {
  /** Helper functions that run within the migration transaction */
  queryT: QueryHelpers;
} & TransactionOptions;
