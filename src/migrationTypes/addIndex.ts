// wildebeest
import { MigrationDefinition } from '@wildebeest/types';
import createIndex from '@wildebeest/utils/createIndex';
import defaultFieldsConstraintName from '@wildebeest/utils/defaultFieldsConstraintName';

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
 * @memberof module:migrationTypes
 *
 * @param options - Options for making a unique constraint across multiple columns
 * @returns The add index migrator
 */
export default function addIndex(
  options: AddIndexOptions,
): MigrationDefinition {
  const { tableName, fields, constraintName } = options;
  // Determine the name of the constraint
  const name = constraintName || defaultFieldsConstraintName(tableName, fields);

  return {
    // Add the unique index
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        createIndex(
          db,
          name,
          {
            tableName,
            fields,
          },
          transactionOptions,
        ),
      ),
    // Remove the index
    down: async (db) =>
      db.transaction((transaction) =>
        db.queryInterface.removeIndex(tableName, name, { transaction }),
      ),
  };
}
