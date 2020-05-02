// global
import { OnDelete } from '@wildebeest/enums';
import { MigrationDefinition } from '@wildebeest/types';
import addTableColumnConstraint from '@wildebeest/utils/addTableColumnConstraint';
import { TableReference } from '@wildebeest/utils/inferTableReference';

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
  return {
    // Add the constraint
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        addTableColumnConstraint(
          wildebeest,
          {
            tableName,
            columnName,
            constraintOptions: {
              type: 'foreign key',
              onDelete,
              onUpdate: 'CASCADE',
              references,
            },
            constraintName:
              constraintName ||
              wildebeest.namingConventions.foreignKeyConstraint(
                tableName,
                columnName,
              ),
          },
          transactionOptions,
        ),
      ),
    // Remove the constraint
    down: async (wildebeest, withTransaction) =>
      withTransaction(({ queryT }) =>
        queryT.raw(
          `ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${
            constraintName ||
            wildebeest.namingConventions.foreignKeyConstraint(
              tableName,
              columnName,
            )
          }";`,
        ),
      ),
  };
}
