// external modules
import { ModelAttributeColumnOptions } from 'sequelize';

// wildebeest
import addTableColumnConstraint from '@wildebeest/helpers/addTableColumnConstraint';
import { TableReference } from '@wildebeest/helpers/inferTableReference';
import { MigrationDefinition, SequelizeMigrator } from '@wildebeest/types';

/**
 * Options for removing a column that is supposed to be non null
 */
export type RemoveNonNullColumnOptions = {
  /** The name of the table to remove the non null column from */
  tableName: string;
  /** The name of the column that should remove the non null constraint from */
  columnName: string;
  /** Get the new column definition */
  getColumn?: (db: SequelizeMigrator) => ModelAttributeColumnOptions;
  /** Override the default constraint name */
  constraintName?: string;
  /** The opposing constraint table reference (when left null will be inferred by column) */
  references?: TableReference;
  /** When true, dont add a constraint on down */
  noDownConstraint?: boolean;
};

/**
 * Remove a column that is not allowed to be null, and when down is run, allow the column to be null
 *
 * @memberof module:migrationTypes
 *
 * @param options - The options for removing the non null column
 * @returns The remove non null column migrator
 */
export default function removeNonNullColumn(
  options: RemoveNonNullColumnOptions,
): MigrationDefinition {
  const {
    tableName,
    columnName,
    getColumn = ({ DataTypes }) => ({
      allowNull: true,
      defaultValue: DataTypes.UUIDV4,
      type: DataTypes.UUID,
    }),
    constraintName,
    references,
    noDownConstraint = false,
  } = options;
  return {
    // Remove the column
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.removeColumn(
          tableName,
          columnName,
          transactionOptions,
        ),
      ),
    // Add the column back with a constraint
    down: async (db, withTransaction) =>
      withTransaction(async (transactionOptions) => {
        await db.queryInterface.addColumn(
          tableName,
          columnName,
          getColumn(db),
          transactionOptions,
        );
        if (!noDownConstraint) {
          await addTableColumnConstraint(
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
            },
            transactionOptions,
          );
        }
      }),
  };
}
