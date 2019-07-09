/* eslint-disable camelcase */

// wildebeest
import defaultConstraintName from '@wildebeest/helpers/defaultConstraintName';
import getForeignKeyConfig from '@wildebeest/helpers/getForeignKeyConfig';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

/**
 * Possible options on association model delete
 *
 * TODO use commons OnDelete
 */
export type OnDelete = 'CASCADE' | 'SET NULL' | 'NO ACTION';

/**
 * Options for changing the onDelete of a table column
 */
export type ChangeOnDeleteOptions = {
  /** The name of the table to change the onDelete for */
  tableName: string;
  /** The name of the column to change the onDelete for */
  columnName: string;
  /** The previous value of onDelete */
  oldOnDelete: OnDelete;
  /** The new value of onDelete */
  newOnDelete: OnDelete;
};

/**
 * Change the onDelete cascade constraint for a table column
 *
 * @param db - The database to migrate
 * @param tableName - The name of the table the constraint refers to
 * @param constraintName - The name of the constraint
 * @param onDelete - What to set onDelete to
 * @returns The change constraint promise
 */
export async function changeConstraintOnDelete(
  db: SequelizeMigrator,
  tableName: string,
  constraintName: string,
  onDelete: OnDelete,
  transactionOptions: MigrationTransactionOptions,
): Promise<void> {
  // Raw query interface
  const { queryT } = transactionOptions;

  // Get the configuration of the old constraint
  const {
    column_name,
    foreign_table_schema,
    foreign_table_name,
    foreign_column_name,
  } = await getForeignKeyConfig(db, constraintName, transactionOptions);

  // Need to first delete the old constraint and make a new one
  await queryT.raw(
    `
    ALTER TABLE "${foreign_table_schema}"."${tableName}"
    DROP CONSTRAINT "${constraintName}",
    ADD CONSTRAINT "${constraintName}"
    FOREIGN KEY ("${column_name}")
    REFERENCES "${foreign_table_schema}"."${foreign_table_name}"("${foreign_column_name}")
    ON DELETE ${onDelete} ON UPDATE CASCADE;
  `,
  );
}

/**
 * Change the onDelete status for a column
 *
 * @memberof module:migrationTypes
 *
 * @param options - The change on delete options
 * @returns he change on delete migrator
 */
export default function changeOnDelete(
  options: ChangeOnDeleteOptions,
): MigrationDefinition {
  const { tableName, columnName, newOnDelete, oldOnDelete } = options;
  const constraintName = defaultConstraintName(tableName, columnName);
  return {
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeConstraintOnDelete(
          db,
          tableName,
          constraintName,
          newOnDelete,
          transactionOptions,
        ),
      ),
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        changeConstraintOnDelete(
          db,
          tableName,
          constraintName,
          oldOnDelete,
          transactionOptions,
        ),
      ),
  };
}
