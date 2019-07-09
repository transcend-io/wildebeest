// commons
import { ApiVersion } from '@commons/api/enums';

// db
import { defaultEnumName } from '@bk/db/helpers';

// wildebeest
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  SequelizeMigrator,
} from '@wildebeest/types';

// local
import { addValuesToEnum, removeValuesFromEnum } from './addEnumValues';
import { changeDefaultValue } from './changeColumnDefault';

/**
 * Options for adding a new api version
 */
export type NewApiVersionOptions = {
  /** The name of the table to add the constraint to */
  version: ApiVersion;
  /** The previous version */
  oldVersion: ApiVersion;
  /** The name of the tables that have a column name `apiVersion` to update */
  tables: string[];
};

/**
 * Add a new version of the api
 *
 * @param table - The table that has the `apiVersion` column to update
 * @param version - The version to add and make default
 * @param transactionOptions - The transaction options
 * @param db - The database to operate on
 * @param columnName - The name of the api version column
 */
export async function addNewVersion(
  table: string,
  version: ApiVersion,
  transactionOptions: MigrationTransactionOptions,
  db: SequelizeMigrator,
  columnName = 'apiVersion',
): Promise<void> {
  // Add the enum values to the column
  await addValuesToEnum(
    db,
    {
      name: defaultEnumName(table, columnName),
      attributes: [version],
      tableName: table,
      columnName,
    },
    transactionOptions,
  );

  // Change the column default
  await changeDefaultValue(table, columnName, version, transactionOptions);
}

/**
 * Add a new version of the api
 *
 * @param table - The table that has the `apiVersion` column to update
 * @param version - The version to add and make default
 * @param transactionOptions - The transaction options
 * @param db - The database to operate on
 * @param columnName - The name of the api version column
 */
export async function removeVersion(
  table: string,
  version: ApiVersion,
  oldVersion: ApiVersion,
  transactionOptions: MigrationTransactionOptions,
  db: SequelizeMigrator,
  columnName = 'apiVersion',
): Promise<void> {
  // Change the column default
  await changeDefaultValue(table, columnName, oldVersion, transactionOptions);

  // Add the enum values to the column
  await removeValuesFromEnum(
    db,
    {
      name: defaultEnumName(table, columnName),
      attributes: [version],
      tableName: table,
      columnName,
    },
    transactionOptions,
  );
}

/**
 * Add a new api version
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for adding a new api version
 * @returns The migrator
 */
export default function newApiVersion(
  options: NewApiVersionOptions,
): MigrationDefinition {
  const { tables, version, oldVersion } = options;
  return {
    // Add the unique index
    up: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tables.map((table) =>
            addNewVersion(table, version, transactionOptions, db),
          ),
        ),
      ),
    // Remove the index
    down: async (db, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tables.map((table) =>
            removeVersion(table, version, oldVersion, transactionOptions, db),
          ),
        ),
      ),
  };
}
