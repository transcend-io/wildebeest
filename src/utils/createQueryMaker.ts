// external
import * as sequelize from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  AnyArray,
  Attributes,
  MigrationTransactionOptions,
  ModelMap,
  QueryHelpers,
  QueryWithTransaction,
} from '@wildebeest/types';

// local
import batchProcess from './batchProcess';
import updateRows from './updateRows';

/**
 * A function should be run with all queries inside a transaction a transaction
 */
export type RunInTransaction<
  TModels extends ModelMap,
  TAttributes extends Attributes = Attributes
> = (
  transactionOptions: MigrationTransactionOptions<TModels, TAttributes>,
) => PromiseLike<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Similar to the function provided to db.transaction
 */
export type WithTransaction<
  TModels extends ModelMap,
  TAttributes extends Attributes = Attributes
> = (
  runInTransaction: RunInTransaction<TModels, TAttributes>,
) => PromiseLike<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Create a query make from sequelize query interface
 *
 * @param queryInterface - The interface to query with
 * @param transactionOptions - The transaction
 * @param type - The query type
 * @returns A query wrapped in transaction
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
  return <T extends AnyArray = AnyArray>(q: string): PromiseLike<T> =>
    queryInterface.sequelize
      .query(q, {
        type,
        ...transactionOptions,
      })
      .then((results) => {
        const casted = (results as any) as T;
        return casted;
      });
}

/**
 * Construct a transaction wrapper helper function that will make it easier for migrations to run in transactions
 *
 * @param wildebeest - The wildebeest configuration
 * @returns A function that takes in the argument of db.transaction but wrapped with extras
 */
export function transactionWrapper<
  TModels extends ModelMap,
  TAttributes extends Attributes
>(
  wildebeest: Wildebeest<TModels>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): (
  runInTransaction: RunInTransaction<TModels, TAttributes>,
) => PromiseLike<any> {
  const { db } = wildebeest;
  return async (runInTransaction: RunInTransaction<TModels, TAttributes>) =>
    db.transaction(async (transaction) => {
      const tOpt = { transaction };

      // Run select with the transaction
      const qT: QueryHelpers<TModels, TAttributes> = {
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
          batchProcess(wildebeest, tableName, whereOptions, processRow, {
            queryT: qT,
            ...tOpt,
          }),
        batchUpdate: (
          tableName,
          getRowDefaults,
          columnDefinitions,
          options,
          batchProcessOptions,
        ) =>
          updateRows(
            wildebeest,
            tableName,
            getRowDefaults,
            columnDefinitions,
            options,
            { queryT: qT, ...tOpt },
            batchProcessOptions,
          ),
      };
      return runInTransaction({ queryT: qT, ...tOpt });
    });
}
