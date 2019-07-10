// wildebeest
import { MigrationDefinition } from '@wildebeest/types';

/**
 * The type of constraint
 */
export type ConstraintType = 'unique';

/**
 * Options for making a column unique
 */
export type MakeColumnUniqueOptions = {
  /** The name of the table to change the column on */
  tableName: string;
  /** The name of the column to make unique */
  columnName: string;
  /** Override the default constraint name */
  constraintName?: string;
  /** The type of constraint to make */
  constraintType?: ConstraintType;
};

/**
 * Make a column unique
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for making the table column unique
 * @returns The make column unique migrator
 */
export default function makeColumnUnique(
  options: MakeColumnUniqueOptions,
): MigrationDefinition {
  const {
    tableName,
    columnName,
    constraintName,
    constraintType = 'unique',
  } = options;
  // The name of the constraint
  const name = constraintName || `${tableName}_${columnName}_key`;

  return {
    // Add the constraint
    up: async ({ db }, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.addConstraint(tableName, [columnName], {
          type: constraintType,
          name,
          ...transactionOptions,
        }),
      ),
    // Remove the constraint
    down: async ({ db }, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.sequelize.query(
          `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${name}";`,
          transactionOptions,
        ),
      ),
  };
}
