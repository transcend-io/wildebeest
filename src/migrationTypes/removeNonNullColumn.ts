// external modules
import { ModelAttributeColumnOptions } from 'sequelize';

// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { MigrationDefinition, ModelMap } from '@wildebeest/types';
import addTableColumnConstraint from '@wildebeest/utils/addTableColumnConstraint';
import { TableReference } from '@wildebeest/utils/inferTableReference';

/**
 * Options for removing a column that is supposed to be non null
 */
export type RemoveNonNullColumnOptions<TModels extends ModelMap> = {
  /** The name of the table to remove the non null column from */
  tableName: string;
  /** The name of the column that should remove the non null constraint from */
  columnName: string;
  /** Get the new column definition */
  getColumn?: (db: WildebeestDb<TModels>) => ModelAttributeColumnOptions;
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
export default function removeNonNullColumn<TModels extends ModelMap>(
  options: RemoveNonNullColumnOptions<TModels>,
): MigrationDefinition<TModels> {
  const {
    tableName,
    columnName,
    getColumn = ({ DataTypes }: WildebeestDb<TModels>) => ({
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
    up: async ({ db }, withTransaction) =>
      withTransaction((transactionOptions) =>
        db.queryInterface.removeColumn(
          tableName,
          columnName,
          transactionOptions,
        ),
      ),
    // Add the column back with a constraint
    down: async (wildebeest, withTransaction) =>
      withTransaction(async (transactionOptions) => {
        await wildebeest.db.queryInterface.addColumn(
          tableName,
          columnName,
          getColumn(wildebeest.db),
          transactionOptions,
        );
        if (!noDownConstraint) {
          await addTableColumnConstraint(
            wildebeest,
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
