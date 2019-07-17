// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { MigrationTransactionOptions, ModelMap } from '@wildebeest/types';

/**
 * Drop an enum from the db
 *
 * @param db - The database to drop the enum from
 * @param name - The name of the enum in the db to remove
 * @param rawTransactionOptions - The existing transaction
 * @param cascade - Cascade result to other references
 * @returns The drop enum promise
 */
export default async function dropEnum<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  name: string,
  transactionOptions?: MigrationTransactionOptions<TModels>,
  cascade?: boolean,
): Promise<void> {
  // Raw query interface
  const { queryInterface } = db;

  // Drop the enum
  await queryInterface.sequelize.query(
    `DROP type IF EXISTS "${name}" ${cascade ? 'CASCADE' : ''};`,
    transactionOptions,
  );
}
