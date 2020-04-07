// external
import camelCase from 'lodash/camelCase';

/**
 * The foreign key table reference the constraint should be made with
 */
export type TableReference = {
  /** The name of the table */
  table: string;
  /** The field aka columnName in the table to reference */
  field: string;
};

/**
 * Infer the default reference fields from a column
 *
 * @example <caption>Example usage of inferTableReference</caption>
 * // { field: 'id', table: 'organizations' }
 * inferTableReference('organizationId');
 *
 * @param column - The name of the column to add the cascade to
 * @param modelNameToTableName - A function that will convert a model name to table name
 * @returns The table and field extracted from the column
 */
export default function inferTableReference(
  column: string,
  modelNameToTableName: (word: string) => string,
): TableReference {
  // Split the column by camel case
  const splitColumn = column.split(/(?=[A-Z])/);

  // The reference table field is by default the camel case version of the camel case word
  const field = camelCase(splitColumn.pop());

  // Determine the name of the reference table
  const table = modelNameToTableName(splitColumn.join(''));

  return { table, field };
}
