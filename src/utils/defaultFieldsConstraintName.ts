// external modules
import { ModelIndexesOptions } from 'sequelize';

// commons
import cases from '@commons/cases';

/**
 * Generate the default table columns constraint name
 *
 * @memberof module:db/helpers
 *
 *
 * @param tableName - The name of the table
 * @param fields - The fields that are being made unique
 * @returns The constraint name
 */
export default function defaultFieldsConstraintName(
  tableName: string,
  fields: ModelIndexesOptions['fields'],
): string {
  return `${cases.snakeCase(tableName)}_${fields
    .map((word) => cases.snakeCase(typeof word === 'string' ? word : word.name))
    .join('_')}`;
}
