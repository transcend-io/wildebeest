// external modules
import { Op } from 'sequelize';

// global
import { MigrationTransactionOptions, ModelMap } from '@wildebeest/types';
import Wildebeest from '@wildebeest/classes/Wildebeest';

// local
import dropEnum from './dropEnum';

/**
 * Options for migrating an enum
 */
export type MigrateEnumOptions = {
  /** The name of the table to migrate against */
  tableName: string;
  /** The name of the enum column to migrate against */
  columnName: string;
  /** The default value of the column */
  defaultValue?: unknown;
  /** Override the default name of the constraint */
  constraintName?: string;
  /** A key->value pairing of values to bulk update for existing rows */
  convertEnum?: { [key in string]: string };
  /** Whether the column allows null value */
  allowNull?: boolean;
  /** When true, drop all rows that do not have a value in the new set of enum values */
  drop?: boolean;
};

/**
 * Migrate an enum column from one enum to another
 *
 * @param wildebeest - The database to migrate against
 * @param enumValue - Theexpected enum
 * @param options - The options for migrating an enum column
 * @param transactionOptions - The current transaction
 * @returns The migrated enum promise
 */
export default async function migrateEnumColumn<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  enumValue: { [key in string]: string },
  options: MigrateEnumOptions,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { queryInterface, DataTypes } = wildebeest.db;
  const { queryT } = transactionOptions;
  const {
    tableName,
    columnName,
    defaultValue,
    constraintName,
    convertEnum,
    allowNull = false,
    drop = false,
  } = options;

  // The name of the enum constraint
  const enumName =
    constraintName || wildebeest.namingConventions.enum(tableName, columnName);

  // Temporarily make the column a string
  await queryInterface.changeColumn(
    tableName,
    columnName,
    {
      type: DataTypes.STRING,
      allowNull,
      defaultValue: null,
    },
    transactionOptions,
  );

  // If there are enum attributes to convert from on value to another, convert them
  if (convertEnum) {
    await Promise.all(
      Object.entries(convertEnum).map(([oldValue, newValue]) =>
        queryT.raw(
          `
        UPDATE "${tableName}" SET "${columnName}"='${newValue}' WHERE "${columnName}"='${oldValue}'
      `,
        ),
      ),
    );
  }

  // Wipe rows that will not validate with the new enum
  if (drop) {
    await queryT.delete(tableName, {
      [columnName]: { [Op.notIn]: Object.values(enumValue) },
    });
  }

  // Drop the old enum
  await dropEnum(wildebeest.db, enumName, transactionOptions);

  // Make the column an enum
  await queryInterface.changeColumn(
    tableName,
    columnName,
    {
      type: DataTypes.ENUM({
        name: enumName,
        values: Object.values(enumValue),
      } as any), // eslint-disable-line @typescript-eslint/no-explicit-any
      allowNull,
    },
    transactionOptions,
  );

  // Set the default value if provided
  if (defaultValue && defaultValue !== 'NULL') {
    await queryT.raw(
      `
      ALTER TABLE "${tableName}"
      ALTER COLUMN "${columnName}"
      SET DEFAULT '${defaultValue}'::"${enumName}"
    `,
    );
  }
}
