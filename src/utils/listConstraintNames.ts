// external modules
import { QueryTypes } from 'sequelize';

// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { MigrationTransactionOptions, ModelMap } from '@wildebeest/types';

/**
 * A db constraint
 */
export type PgConstraint = {
  /** The name of the constraint */
  conname: string;
};

/**
 * List constraints related to a table
 *
 * @param db - The db instance to check
 * @param tableName - The table to list constraints for
 * @returns The names of the constraints
 */
export default async function listConstraintNames<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
  transactionOptions?: MigrationTransactionOptions<TModels>,
): Promise<string[]> {
  const { queryInterface } = db;
  //  Determine the constraints
  const constraints: PgConstraint[] = await queryInterface.sequelize.query(
    `SELECT con.*
       FROM pg_catalog.pg_constraint con
            INNER JOIN pg_catalog.pg_class rel
                       ON rel.oid = con.conrelid
            INNER JOIN pg_catalog.pg_namespace nsp
                       ON nsp.oid = connamespace
       WHERE nsp.nspname = 'public'
             AND rel.relname = '${tableName}'`,
    {
      ...transactionOptions,
      type: QueryTypes.SELECT,
    },
  );
  return constraints.map(({ conname }) => conname);
}
