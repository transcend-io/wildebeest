// external modules
import sequelize from 'sequelize';

// global
import { MigrationTransactionOptions } from '@wildebeest/types';
import inferTableReference from '@wildebeest/utils/inferTableReference';
import Wildebeest from '@wildebeest/Wildebeest';

/**
 * Options for adding a constraint to a table
 */
export type AddTableConstraintOptions = {
  /** The name of the table */
  tableName: string;
  /** The name of the column */
  columnName: string;
  /** The add constraint options to pass to queryInterface.addConstraint */
  constraintOptions: sequelize.AddForeignKeyConstraintOptions;
  /** Override the name of the constraint */
  constraintName?: string;
  /** When true, drop the constraint if it exists */
  drop?: boolean;
};

/**
 * Add a constraint on a table column
 *
 * @param db - The database to add the table constraint to
 * @param options - The add constraint options
 * @param rawTransactionOptions - The current transaction
 * @returns The create constraint promise
 */
export default async function addTableColumnConstraint(
  { db, namingConventions }: Wildebeest,
  options: AddTableConstraintOptions,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  // Raw query interface
  const { queryInterface } = db;
  const { queryT } = transactionOptions;
  const {
    tableName,
    columnName,
    constraintOptions,
    constraintName,
    drop = false,
  } = options;
  const { references, ...otherConstraintOptions } = constraintOptions;

  // Determine the name of the constraint
  const useConstraintName =
    constraintName ||
    namingConventions.foreignKeyConstraint(tableName, columnName);

  // Drop the constraint first
  if (drop) {
    await queryT.raw(
      `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${useConstraintName}";`,
    );
  }
  // Add the new constraint
  await queryInterface.addConstraint(tableName, [columnName], {
    type: 'foreign key', // default constraint is a foreign key
    name: useConstraintName,
    references: references || inferTableReference(columnName),
    ...otherConstraintOptions,
    ...transactionOptions,
  });
}
