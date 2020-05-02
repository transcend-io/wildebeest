// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
} from '@wildebeest/types';

/**
 * A migration that should run on the db
 */
export type TransactionMigrationDefinition = {
  /** The up migration (there should be no loss of data) */
  up: (
    transactionOptions: MigrationTransactionOptions,
    wildebeest: Wildebeest,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (
    transactionOptions: MigrationTransactionOptions,
    wildebeest: Wildebeest,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

/**
 * A helper to wrap a custom migration in a transaction
 *
 * @param options - The custom options
 * @returns The custom migrator
 */
export default function custom(
  options: TransactionMigrationDefinition,
): MigrationDefinition {
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
