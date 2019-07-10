// wildebeest
import {
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * Options for creating an index
 * @see http://docs.sequelizejs.com/class/lib/query-interface.js~QueryInterface.html#instance-method-addIndex
 */
export type CreateIndexOptions = {
  /** The table to create the index in */
  tableName: string;
  /** The attributes to create the index on */
  fields: string[];
  /** Whether the index is a unique one */
  unique?: boolean;
};

/**
 * Creates a new index, main purpose is to override @types/sequelize
 *
 * @param db - The db to create the index in
 * @param name - Tha name of the index
 * @param options - The index options
 * @param transactionOptions - The transaction options
 */
export default async function createIndex(
  db: SequelizeMigrator,
  name: string,
  options: CreateIndexOptions,
  transactionOptions?: MigrationTransactionOptions,
): Promise<void> {
  const { tableName, fields, ...rest } = options;
  await db.queryInterface.addIndex(tableName, fields, {
    fields,
    name,
    ...rest,
    ...transactionOptions,
  });
}
