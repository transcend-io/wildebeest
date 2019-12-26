// global
import { MigrationDefinition, ModelMap } from '@wildebeest/types';
import { invert } from '@wildebeest/utils';
import migrateEnumColumn from '@wildebeest/utils/migrateEnumColumn';

/**
 * Options for changing an enum column definition, needs to temporarily migrate to a string
 */
export type ChangeEnumColumnOptions = {
  /** The name of the table to change the enum on */
  tableName: string;
  /** The name of the column to change the enum on */
  columnName: string;
  /** The old enum definition */
  oldEnum: string[] | { [key in string]: string };
  /** The new enum definition */
  newEnum: string[] | { [key in string]: string };
  /** The old default value for the column */
  oldDefault?: string;
  /** The new default value for the column */
  newDefault?: string;
  /** The name of the enum constraint, default will be determined */
  constraintName?: string;
  /** When true, drop any row entries that have an invalid enum value */
  drop?: boolean;
  /** Enum values to change from one to another on up (and inverted on down if no inverse explicitly specified) */
  convertEnum?: { [key in string]: string };
  /** Enum values to change from one to another on down */
  convertEnumInverse?: { [key in string]: string };
};

/**
 * Change a column that is an enum to a new enum value
 *
 * @param options - Options for changing a column thats an enum
 * @returns The change enum column migrator
 */
export default function changeEnumColumn<TModels extends ModelMap>(
  options: ChangeEnumColumnOptions,
): MigrationDefinition<TModels> {
  const {
    tableName,
    columnName,
    oldEnum,
    newEnum,
    constraintName,
    oldDefault,
    newDefault,
    convertEnum,
    convertEnumInverse,
    drop = false,
  } = options;
  // Convert the tables to modify to a list
  const tableNames: string[] = Array.isArray(tableName)
    ? tableName
    : [tableName];

  return {
    // Migrate the enums forward
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tableNames.map((table) =>
            migrateEnumColumn(
              wildebeest,
              Array.isArray(newEnum)
                ? newEnum.reduce(
                    (acc, val) => Object.assign(acc, { [val]: val }),
                    {},
                  )
                : newEnum,
              {
                tableName: table,
                columnName,
                defaultValue: newDefault,
                constraintName,
                convertEnum,
                drop,
              },
              transactionOptions,
            ),
          ),
        ),
      ),
    // Migrate the enums backwards
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tableNames.map((table) => {
            const enumConverter =
              convertEnumInverse || (convertEnum ? invert(convertEnum) : null);
            return migrateEnumColumn(
              wildebeest,
              Array.isArray(oldEnum)
                ? oldEnum.reduce(
                    (acc, val) => Object.assign(acc, { [val]: val }),
                    {},
                  )
                : oldEnum,
              {
                tableName: table,
                columnName,
                defaultValue: oldDefault,
                constraintName,
                ...(enumConverter ? { convertEnum: enumConverter } : {}),
                drop,
              },
              transactionOptions,
            );
          }),
        ),
      ),
  };
}
