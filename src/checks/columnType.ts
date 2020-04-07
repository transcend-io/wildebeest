// external
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { ModelMap, SyncError } from '@wildebeest/types';

/**
 * Mapping from sequelize type to data type
 */
export const SEQUELIZE_TO_DATA_TYPE: { [k in string]: string } = {
  BLOB: 'bytea',
  BOOLEAN: 'boolean',
  DATE: 'timestamp with time zone',
  ENUM: 'USER-DEFINED',
  FLOAT: 'double precision',
  INTEGER: 'integer',
  STRING: 'character varying',
  JSONB: 'jsonb',
  TEXT: 'text',
  UUID: 'uuid',
};

/**
 * Determine the type of a column in the db
 *
 * @param db - The database to operate on
 * @param tableName - The name of the table
 * @param columnName - The name of the column
 * @returns The type of the column in postgres
 */
export async function getColumnType<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
  columnName: string,
): Promise<string> {
  // Get the type for the column
  const [{ data_type }] = await db.queryInterface.sequelize.query(
    `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = '${tableName}' AND column_name = '${columnName}';
  `,
    {
      type: QueryTypes.SELECT,
    },
  );

  return data_type;
}

/**
 * Check that the type of a column matches postgres
 *
 * @param db - The db to test on
 * @param tableName - The name of the table to operate on
 * @param name - The name of the column
 * @param definition - The model definition
 * @returns Any errors related to the type of the column
 */
export default async function checkColumnType<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Get the current type
  const currentType = await getColumnType(db, tableName, name);

  // Get the expected type
  const expectedConstructorName = definition.type.constructor.name;
  const expectedType =
    SEQUELIZE_TO_DATA_TYPE[expectedConstructorName] || expectedConstructorName;

  // Check if type is correct
  if (expectedType !== currentType) {
    errors.push({
      message: `Unexpected type for column: "${name}" on table "${tableName}". Got "${currentType}" expected "${expectedType}"`, // eslint-disable-line max-len
      tableName,
    });
  }

  return errors;
}
