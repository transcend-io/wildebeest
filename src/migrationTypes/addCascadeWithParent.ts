// wildebeest
import { MigrationDefinition } from '@wildebeest/types';
import addTableColumnConstraint from '@wildebeest/utils/addTableColumnConstraint';
import defaultConstraintName from '@wildebeest/utils/defaultConstraintName';
import { TableReference } from '@wildebeest/utils/inferTableReference';

// local
import { OnDelete } from './changeOnDelete';

/**
 * Options for making a column cascade with its parent
 */
export type CascadeWithParentOptions = {
  /** The name of the table to add the cascade to */
  tableName: string;
  /** The name of the column in the table that needs the constraint */
  columnName: string;
  /** Specify the foreign key constraint manually */
  references?: TableReference;
  /** The name of the constraint, if left null will be inferred */
  constraintName?: string;
  /** The on delete setting for the constraint */
  onDelete?: OnDelete;
};

/**
 * Add a constraint to a column to have an on delete cascade when it's parent is cascaded
 *
 * @memberof module:migrationTypes
 *
 * @param options - The add cascade with parent migrator options
 * @returns The add cascade with parent migrator
 */
export default function addCascadeWithParent(
  options: CascadeWithParentOptions,
): MigrationDefinition {
  const {
    tableName,
    columnName,
    references,
    constraintName,
    onDelete = 'CASCADE',
  } = options;
  // The name of the constraint
  const useConstraintName =
    constraintName || defaultConstraintName(tableName, columnName);

  return {
    // Add the constraint
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        addTableColumnConstraint(
          db,
          {
            tableName,
            columnName,
            constraintOptions: {
              type: 'foreign key',
              onDelete,
              onUpdate: 'CASCADE',
              references,
            },
            constraintName: useConstraintName,
          },
          transactionOptions,
        ),
      ),
    // Remove the constraint
    down: async (db, withTransaction) =>
      withTransaction(({ queryT }) =>
        queryT.raw(
          `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${useConstraintName}";`,
        ),
      ),
  };
}
