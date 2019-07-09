// wildebeest
import addTableColumnConstraint from '@wildebeest/helpers/addTableColumnConstraint';
import { TableReference } from '@wildebeest/helpers/inferTableReference';
import { MigrationDefinition } from '@wildebeest/types';

// local
import { OnDelete } from './changeOnDelete';

/**
 * Options for changing the cascade on a foreign key
 */
export type CascadeWithParentOptions = {
  /** The name of the table to add the cascade on */
  tableName: string;
  /** The name of the column on the table that should be cascading */
  columnName: string;
  /**  The references for the table where the constraint is made */
  references?: TableReference;
  /** The name of the constraint, if left null will be inferred */
  constraintName?: string;
  /** What should occur when parent is deleted */
  onDelete?: OnDelete;
};

/**
 * Update a column to have an on delete cascade when it's parent is cascaded
 *
 * @memberof module:migrationTypes
 *
 * @param {module:migrations/typeDefs~CascadeWithParentOptions} options - The add cascade with parent migrator options
 * @returns The cascade with parent migrator
 */
export default function cascadeWithParent(
  options: CascadeWithParentOptions,
): MigrationDefinition {
  const {
    tableName,
    columnName,
    references,
    constraintName,
    onDelete = 'cascade',
  } = options;
  return {
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
              onUpdate: 'cascade',
              references,
            },
            constraintName,
            drop: true,
          },
          transactionOptions,
        ),
      ),
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        addTableColumnConstraint(
          db,
          {
            tableName,
            columnName,
            constraintOptions: {
              type: 'foreign key',
              onDelete: 'set null',
              onUpdate: 'cascade',
              references,
            },
            constraintName,
            drop: true,
          },
          transactionOptions,
        ),
      ),
  };
}
