// wildebeest
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * A migration that should run on the db
 */
export type TransactionMigrationDefinition = {
  /** The up migration (there should be no loss of data) */
  up: (
    transactionOptions: MigrationTransactionOptions,
    db: SequelizeMigrator,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (
    transactionOptions: MigrationTransactionOptions,
    db: SequelizeMigrator,
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
export default function custom(
  options: TransactionMigrationDefinition,
): MigrationDefinition {
  const { up, down } = options;
  return {
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        up(transactionOptions, wildebeest.db),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        down(transactionOptions, wildebeest.db),
      ),
  };
}
