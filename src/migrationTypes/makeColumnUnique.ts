// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';

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
export default function makeColumnUnique<TModels extends ModelMap>(
  options: MakeColumnUniqueOptions,
): MigrationDefinition<TModels> {
  const {
    tableName,
    columnName,
    constraintName,
    constraintType = 'unique',
  } = options;
  return {
    // Add the constraint
    up: async ({ db, namingConventions }, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.addConstraint(tableName, [columnName], {
          type: constraintType,
          name:
            constraintName ||
            namingConventions.uniqueConstraint(tableName, columnName),
          ...transactionOptions,
        }),
      ),
    // Remove the constraint
    down: async ({ db, namingConventions }, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.sequelize.query(
          `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraintName ||
            namingConventions.uniqueConstraint(tableName, columnName)}";`,
          transactionOptions,
        ),
      ),
  };
}
