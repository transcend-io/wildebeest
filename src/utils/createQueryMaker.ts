// external modules
import * as sequelize from 'sequelize';

// wildebeest
import {
  MigrationTransactionOptions,
  QueryHelpers,
  QueryWithTransaction,
} from '@wildebeest/types';
import Wildebeest from '@wildebeest';

// local
import batchProcess from './batchProcess';
import updateRows from './updateRows';

/**
 * A function should be run with all queries inside a transaction a transaction
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RunInTransaction<T = any> = (
  transactionOptions: MigrationTransactionOptions,
) => PromiseLike<T>;

/**
 * Similar to the function provided to db.transaction
 */
export type WithTransaction = (
  runInTransaction: RunInTransaction,
) => PromiseLike<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Create a query make from sequelize query interface
 *
 * @memberof module:migrations/helpers
 *
 */
export default function createQueryMaker(
  queryInterface: sequelize.QueryInterface,
  transactionOptions: {
    /** The transaction */
    transaction: sequelize.Transaction;
  },
  type: sequelize.QueryTypes = sequelize.QueryTypes.SELECT,
): QueryWithTransaction {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <T = any>(q: string): PromiseLike<T[]> =>
    queryInterface.sequelize
      .query(q, {
        type,
        ...transactionOptions,
      })
      .then((results) => {
        const casted = results as T[];
        return casted;
      });
}

/**
 * Construct a transaction wrapper helper function that will make it easier for migrations to run in transactions
 * @param db - The database to operate on
 * @returns A function that takes in the argument of db.transaction but wrapped with extras
 */
export function transactionWrapper(
  wildebeest: Wildebeest,
): (runInTransaction: RunInTransaction) => PromiseLike<any> {
  const { db } = wildebeest;
  return async <BP>(runInTransaction: RunInTransaction) =>
    db.transaction(async (transaction) => {
      const tOpt = { transaction };

      // Run select with the transaction
      const qT: QueryHelpers = {
        delete: async (tableName, options = {}) =>
          db.queryInterface.bulkDelete(tableName, options, tOpt),
        insert: async (tableName, items) => {
          if (items.length === 0) {
            return null;
          }
          return db.queryInterface.bulkInsert(tableName, items, tOpt);
        },
        select: createQueryMaker(
          db.queryInterface,
          tOpt,
          sequelize.QueryTypes.SELECT,
        ),
        raw: createQueryMaker(
          db.queryInterface,
          tOpt,
          sequelize.QueryTypes.RAW,
        ),
        batchProcess: (tableName, whereOptions, processRow) =>
          batchProcess<BP>(wildebeest, tableName, whereOptions, processRow, {
            queryT: qT,
            ...tOpt,
          }),
        batchUpdate: (tableName, getRowDefaults, columnDefinitions, options) =>
          updateRows(
            wildebeest,
            tableName,
            getRowDefaults,
            columnDefinitions,
            options,
            { queryT: qT, ...tOpt },
          ),
      };
      return runInTransaction({ queryT: qT, ...tOpt });
    });
}
