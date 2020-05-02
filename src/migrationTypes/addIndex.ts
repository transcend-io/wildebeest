// global
import { MigrationDefinition } from '@wildebeest/types';
import createIndex from '@wildebeest/utils/createIndex';

/**
 * Options for adding a new index
 */
export type AddIndexOptions = {
  /** The name of the table to add the constraint to */
  tableName: string;
  /** The name of the columns to make unique across */
  fields: string[];
  /** Override the constraint name (leave null for default) */
  constraintName?: string;
};

/**
 * Create a regular index on a column or set of columns in a table
 *
 * @param options - Options for making a unique constraint across multiple columns
 * @returns The add index migrator
 */
export default function addIndex(
  options: AddIndexOptions,
): MigrationDefinition {
  const { tableName, fields, constraintName } = options;
  return {
    // Add the unique index
    up: async ({ db, namingConventions }, withTransaction) =>
      withTransaction((transactionOptions) =>
        createIndex(
          db,
          constraintName ||
            namingConventions.fieldsConstraint(tableName, fields),
          {
            tableName,
            fields,
          },
          transactionOptions,
        ),
      ),
    // Remove the index
    down: async ({ db, namingConventions }, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.removeIndex(
          tableName,
          constraintName ||
            namingConventions.fieldsConstraint(tableName, fields),
          transactionOptions,
        ),
      ),
  };
}
