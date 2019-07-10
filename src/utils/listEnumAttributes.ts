// external modules
import { QueryTypes } from 'sequelize';

// global
import {
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * Unnested Value
 */
export type UnnestedAttr = {
  /** The name of the attribute */
  unnest: string;
};

/**
 * List indexes related to a table
 *
 * @param db - The database to list enum values from
 * @param name - The name of the enum to list the values from
 * @param rawTransactionOptions - The transaction options
 * @returns The enum attributes
 */
export default async function listEnumAttributes(
  db: SequelizeMigrator,
  name: string,
  transactionOptions?: MigrationTransactionOptions,
): Promise<string[]> {
  // Raw query interface
  const { queryInterface } = db;

  //  Determine the indexes
  const values: UnnestedAttr[] = await queryInterface.sequelize.query(
    `SELECT unnest(enum_range(NULL::"${name}"))`,
    { type: QueryTypes.SELECT, ...transactionOptions },
  );
  return values.map(({ unnest }) => unnest);
}
