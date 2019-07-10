// external modules
import { ModelAttributeColumnOptions } from 'sequelize';

// global
import Wildebeest from '@wildebeest/Wildebeest';

// local
import getColumnDefault from '@wildebeest/utils/getColumnDefault';
import isEnum from '@wildebeest/utils/isEnum';

/**
 * Ensure the default value of a sequelize definition matches the default value in postgres
 *
 * @memberof module:checks
 *
 * @param model - The model to check
 * @param name - The name of the column
 * @param definition - The attribute definition
 * @returns True if the association config is proper
 */
export default async function DefaultValue(
  { db, logger, namingConventions }: Wildebeest,
  tableName: string,
  name: string,
  definition: ModelAttributeColumnOptions,
): Promise<boolean> {
  // Determine the current default
  const currentDefault = await getColumnDefault(db, tableName, name);

  // Determine the expected default
  let expectedDefault = definition.defaultValue as any;

  // If autoIncrement
  if (definition.autoIncrement) {
    expectedDefault = `nextval('${tableName}_${name}_seq'::regclass)`;
    // Undefined -> null
  } else if (expectedDefault === undefined) {
    expectedDefault = null;
    // UUID -> null
  } else if (expectedDefault && expectedDefault.constructor.name === 'UUIDV4') {
    expectedDefault = null;
    // Boolean or number converted to string
  } else if (['boolean', 'number'].includes(typeof expectedDefault)) {
    expectedDefault = expectedDefault.toString();
    // Function -> null
  } else if (typeof expectedDefault === 'function') {
    expectedDefault = null;
    // Enum -> enum syntax of a string
  } else if (isEnum(definition) && typeof expectedDefault === 'string') {
    let enumName = namingConventions.enum(tableName, name);
    const isLower = enumName === enumName.toLowerCase();
    if (!isLower) {
      enumName = `"${enumName}"`;
    }
    expectedDefault = `'${expectedDefault}'::${enumName}`;
    // If a string and not an enum
  } else if (typeof expectedDefault === 'string') {
    expectedDefault = `'${expectedDefault}'::character varying`;
    // If an object in jsonb, stringify
  } else if (
    typeof expectedDefault === 'object' &&
    (definition.type.constructor as any).key === 'JSONB' // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    expectedDefault = `'${JSON.stringify(expectedDefault)}'::jsonb`;
  }

  // Check if the default value is set
  const defaultsMatch = expectedDefault === currentDefault;
  if (!defaultsMatch) {
    logger.error(
      `Invalid default for "${name}" on table "${tableName}". Got "${currentDefault}" expected "${expectedDefault}"`,
    );
  }

  return defaultsMatch;
}
