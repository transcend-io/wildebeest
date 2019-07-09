// external modules
import keyBy from 'lodash/keyBy';

/**
 * Foreign key constraint definition for a table column
 */
export type ColumnConstraint = {
  /** The name of the column */
  columnName: string;
  /** The name of foreign the table */
  tableName?: string;
  /** The name of the foreign key column name */
  foreignColumnName?: string;
};

/**
 * Shorthand constraint input is to specify columnName only and use the default table name (removing `Id`)
 */
export type RawConstraint = string | ColumnConstraint;

/**
 * Index foreign key constraints by name of column
 */
export default function indexConstraints(
  constraints: RawConstraint[],
): { [columnName in string]: ColumnConstraint } {
  // Index constraints so the can be looked up by columnName
  const columnConstraints: ColumnConstraint[] = constraints.map((constraint) =>
    typeof constraint === 'string'
      ? {
          columnName: constraint,
        }
      : constraint,
  );
  return keyBy(columnConstraints, 'columnName');
}
