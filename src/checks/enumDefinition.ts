// external modules
import difference from 'lodash/difference';
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { ModelMap, SyncError } from '@wildebeest/types';

/**
 * Unnested Value
 */
export type UnnestedAttr = {
  /** The name of the attribute */
  unnest: string;
};

/**
 * List the values that an enum can take on in the db
 *
 * @param db - The db instance to check
 * @param name - The name of the enum
 * @returns The enum values
 */
export async function listEnumValues<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  name: string,
): Promise<string[]> {
  const enumValues: UnnestedAttr[] = await db.queryInterface.sequelize.query(
    `SELECT unnest(enum_range(NULL::"${name}")) `,
    {
      type: QueryTypes.SELECT,
    },
  );
  return enumValues.map(({ unnest }) => unnest);
}

/**
 * Check if the database has an enum definition
 *
 * @param db - The db instance
 * @param name - The name of the enum
 * @returns True if the enum is defined
 */
export async function hasEnum<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  name: string,
): Promise<boolean> {
  const [enumItem] = await db.queryInterface.sequelize.query(
    `
    SELECT distinct pg_type.typname AS enum_type FROM pg_type
    JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
    WHERE pg_type.typname='${name}';
  `,
    {
      type: QueryTypes.SELECT,
    },
  );
  return !!enumItem;
}

/**
 * Check that an enum in the database matches an enum attribute column
 *
 * @param wildebeest - The wildebeest config
 * @param tableName - The name of the table to check
 * @param name - The name of the attribute
 * @param definition - The enum attribute definition
 * @returns Any errors related to enum definitions
 */
export default async function EnumDefinition<TModels extends ModelMap>(
  { namingConventions, db }: Wildebeest<TModels>,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // The expected name of the enum
  const expectedEnumName = namingConventions.enum(tableName, name);

  // Check if the enum exists
  const enumExists = await hasEnum(db, expectedEnumName);

  // Ensure that the enum values match
  if (enumExists) {
    // Determine the existing and expected values
    const currentValues = await listEnumValues(db, expectedEnumName);
    const expectedValues = definition.values || [];

    // Ensure there are no extra values
    const extraValues = difference(currentValues, expectedValues);
    if (extraValues.length > 0) {
      errors.push({
        message: `Extra enum values for "${expectedEnumName}": "${extraValues.join(
          '", "',
        )}"`,
        tableName,
      });
    }

    // Ensure there are no missing values
    const missingValues = difference(expectedValues, currentValues);
    if (missingValues.length > 0) {
      errors.push({
        message: `Missing enum values for "${expectedEnumName}": "${missingValues.join(
          '", "',
        )}"`,
        tableName,
      });
    }
  } else {
    errors.push({
      message: `Could not find enum: "${expectedEnumName}"`,
      tableName,
    });
  }

  return errors;
}
