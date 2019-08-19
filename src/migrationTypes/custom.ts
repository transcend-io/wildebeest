// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';

/**
 * A migration that should run on the db
 */
export type TransactionMigrationDefinition<TModels extends ModelMap> = {
  /** The up migration (there should be no loss of data) */
  up: (
    transactionOptions: MigrationTransactionOptions<TModels>,
    wildebeest: Wildebeest<TModels>,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (
    transactionOptions: MigrationTransactionOptions<TModels>,
    wildebeest: Wildebeest<TModels>,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * A helper to wrap a custom migration in a transaction
 *
 * @memberof module:migrationTypes
 *
 * @param options - The custom options
 * @returns The custom migrator
 */
export default function custom<TModels extends ModelMap>(
  options: TransactionMigrationDefinition<TModels>,
): MigrationDefinition<TModels> {
  const { up, down } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        up(transactionOptions, wildebeest),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        down(transactionOptions, wildebeest),
      ),
  };
}
