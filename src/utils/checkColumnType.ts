// external modules
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// wildebeest
import { SequelizeMigrator } from '@wildebeest/types';
import Wildebeest from '@wildebeest';

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
export async function getColumnType(
  db: SequelizeMigrator,
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
 * @memberof module:migrations/helpers
 *
 * @param model - The db model to check for
 * @param name - The name of the column
 * @param definition - The model definition
 * @returns True if the column type matches postgres
 */
export default async function checkColumnType(
  { logger, db }: Wildebeest,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<boolean> {
  // Get the current type
  const currentType = await getColumnType(db, tableName, name);

  // Get the expected type
  const expectedConstructorName = definition.type.constructor.name;
  const expectedType =
    SEQUELIZE_TO_DATA_TYPE[expectedConstructorName] || expectedConstructorName;

  // Check if type is correct
  const correctType = expectedType === currentType;
  if (!correctType) {
    logger.error(
      `Unexpected type for column: "${name}" on table "${tableName}". Got "${currentType}" expected "${expectedType}"`,
    );
  }

  return correctType;
}
