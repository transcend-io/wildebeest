// external modules
import difference from 'lodash/difference';
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// wildebeest
import { SequelizeMigrator } from '@wildebeest/types';
import Wildebeest from '@wildebeest';

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
export async function listEnumValues(
  db: SequelizeMigrator,
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
export async function hasEnum(
  db: SequelizeMigrator,
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
 * @memberof module:migrations/helpers
 *
 * @param wildebeest - The wildebeest config
 * @param tableName - The name of the table to check
 * @param name - The name of the attribute
 * @param definition - The enum attribute definition
 * @returns True if the enum value is valid
 */
export default async function checkEnumDefinition(
  wildebeest: Wildebeest,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<boolean> {
  let valid = true;

  // The expected name of the enum
  const expectedEnumName = wildebeest.namingConventions.enum(tableName, name);

  // Check if the enum exists
  const enumExists = await hasEnum(wildebeest.db, expectedEnumName);
  valid = valid && enumExists;

  // Ensure that the enum values match
  if (enumExists) {
    // Determine the existing and expected values
    const currentValues = await listEnumValues(wildebeest.db, expectedEnumName);
    const expectedValues = definition.values || [];

    // Ensure there are no extra values
    const extraValues = difference(currentValues, expectedValues);
    const hasExtraValues = extraValues.length > 0;
    if (hasExtraValues) {
      wildebeest.logger.error(
        `Extra enum values for "${expectedEnumName}": "${extraValues.join(
          '", "',
        )}"`,
      );
    }

    // Ensure there are no missing values
    const missingValues = difference(expectedValues, currentValues);
    const hasMissingValues = missingValues.length > 0;
    if (hasMissingValues) {
      wildebeest.logger.error(
        `Missing enum values for "${expectedEnumName}": "${missingValues.join(
          '", "',
        )}"`,
      );
    }
    valid = valid && !hasMissingValues && !hasExtraValues;
  } else {
    wildebeest.logger.error(`Could not find enum: "${expectedEnumName}"`);
  }

  return valid;
}
