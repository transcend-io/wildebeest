// external modules
import { QueryTypes } from 'sequelize';

// wildebeest
import { MigrationTransactionOptions, SequelizeMigrator } from '@wildebeest/types';

/**
 * A db index
 */
export type PgIndex = {
  /** The name of the index */
  indexname: string;
};

/**
 * List indexes related to a table
 *
 * @memberof module:migrations/helpers
 *
 * @param db - The db instance to check
 * @param tableName - The table to list indexes for
 * @returns The names of the indexes
 */
export default async function listIndexNames(
  db: SequelizeMigrator,
  tableName: string,
  transactionOptions?: MigrationTransactionOptions,
): Promise<string[]> {
  const { queryInterface } = db;
  //  Determine the indexes
  const indexes: PgIndex[] = await queryInterface.sequelize.query(
    `select * from pg_indexes where tableName='${tableName}'`,
    {
      ...transactionOptions,
      type: QueryTypes.SELECT,
    },
  );
  return indexes.map(({ indexname }) => indexname);
}
