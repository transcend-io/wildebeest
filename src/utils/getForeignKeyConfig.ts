// external modules
import { QueryTypes } from 'sequelize';

// global
import {
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * The foreign key constraint
 */
export type ForeignKeyConstraintConfig = {
  /** The table where the constraint lives */
  table_name: string;
  /** The name of the column that the constraint exists on */
  column_name: string;
  /** The name of the constraint */
  constraint_name: string;
  /** The name of the schema where the column exists */
  foreign_table_schema: string;
  /** The name of the table the constraint exists with */
  foreign_table_name: string;
  /** The name of the column on the foreign table that the constraint exists with */
  foreign_column_name: string;
  /** The definition for the constraint */
  foreign_definition: string;
  /** The update rule */
  update_rule: string;
  /** The delete rule */
  delete_rule: string;
};

/**
 * Get the configuration for a foreign key constraint
 *
 * @param db - The database to list the foreign key config from
 * @param name - The name of the constraint
 * @param rawTransactionOptions - The current transaction options
 * @returns The foreign key constraint config
 */
export default async function getForeignKeyConfig(
  db: SequelizeMigrator,
  name: string,
  transactionOptions?: MigrationTransactionOptions,
): Promise<ForeignKeyConstraintConfig> {
  const [config] = await db.queryInterface.sequelize.query(
    `
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        pg_catalog.pg_get_constraintdef(pg_constraint.oid, true) AS foreign_definition,
        update_rule,
        delete_rule
    FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN pg_constraint
          ON pg_constraint.conname = tc.constraint_name
        LEFT OUTER JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name and ccu.table_schema = rc.constraint_schema

    WHERE constraint_type = 'FOREIGN KEY' AND tc.constraint_name = '${name}'
  `,
    { type: QueryTypes.SELECT, ...transactionOptions },
  );

  return config;
}
