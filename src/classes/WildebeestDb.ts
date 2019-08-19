/**
 *
 * ## Wildebeest Db
 * A modified sequelize database class with helper functions useful to wildebeest
 *
 * @module WildebeestDb
 * @see module:wildebeest
 */

// external modules
import {
  DataTypes,
  Options,
  QueryInterface,
  Sequelize,
  Transaction,
} from 'sequelize';

// global
import { ModelMap, StringKeys } from '@wildebeest/types';

// local
import WildebeestModel from './WildebeestModel'; // eslint-disable-line @typescript-eslint/no-unused-vars

/**
 * A db model
 */
export default class WildebeestDb<
  TModels extends ModelMap<TModelConstructor>,
  TModelConstructor extends typeof WildebeestModel = typeof WildebeestModel
> extends Sequelize {
  /** No need to call getter to access queryInterface during migrations */
  public queryInterface: QueryInterface;

  /** The data types */
  public DataTypes = DataTypes;

  /** Db model needs to be fixed */
  public model!: <TModelName extends StringKeys<TModels>>(
    modelName: TModelName,
  ) => TModels[TModelName];

  /**
   * Connect a global query interface
   *
   * @param databaseUri - The URI of the db
   * @param options - Additional options
   */
  public constructor(databaseUri: string, options?: Options) {
    super(databaseUri, options);
    this.queryInterface = this.getQueryInterface();
  }

  /**
   * Helper to continue transaction or create a new
   *
   * @param options - The transaction options
   * @param callback - The callback to execute in a transaction
   * @returns The callback result
   */
  public continueTransaction<
    TOptions extends
      | {
          /** The current transaction */
          transaction: Transaction;
        }
      | undefined,
    T
  >(
    options: TOptions,
    callback: (t: Transaction) => PromiseLike<T>,
  ): Promise<T> {
    if (options && options.transaction) {
      return Promise.resolve(callback(options.transaction));
    }
    return this.transaction((t) => callback(t));
  }
}
