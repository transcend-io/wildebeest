// external modules
import { ModelAttributeColumnOptions } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import {
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';
import { dropEnum, isEnum, migrateEnumColumn } from '@wildebeest/utils';

/**
 * Change a single column in a table
 */
export type ChangeColumnOptions<TModels extends ModelMap> = {
  /** The name of the column to change */
  columnName: string;
  /** The new column definition */
  getNewColumn: (db: WildebeestDb<TModels>) => ModelAttributeColumnOptions;
  /** The previous column definition (only needed when optimizing updates) */
  getOldColumn: (db: WildebeestDb<TModels>) => ModelAttributeColumnOptions;
  /** When true, drop all rows */
  drop?: boolean;
  /** When true, drop all null values */
  destroy?: boolean;
};

/**
 * Change a single column in a table
 */
export type ChangeTableColumnOptions<TModels extends ModelMap> = {
  /** The name(S) of the table to change the column on */
  tableName: string | string[];
} & ChangeColumnOptions<TModels>;

/**
 * Change column on a single table
 */
export type ChangeSingleColumnOptions<TModels extends ModelMap> = {
  /** The name of the table to change the column on */
  tableName: string;
} & ChangeColumnOptions<TModels>;

/**
 * Change the definition of a column
 *
 * @param options - Options for changing a column definition
 * @returns The change column promise
 */
export async function changeColumnDefinition<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: ChangeSingleColumnOptions<TModels>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { queryInterface } = wildebeest.db;
  const { queryT } = transactionOptions;
  const {
    tableName,
    columnName,
    getNewColumn,
    getOldColumn = () => ({}),
    drop = false,
    destroy = false,
  } = options;

  const newColumn = getNewColumn(wildebeest.db);
  const oldColumn = getOldColumn(wildebeest.db) as ModelAttributeColumnOptions;

  // Check to see if changing to non null and a default value is provided
  const updatedNulls =
    newColumn.allowNull === false &&
    oldColumn.allowNull === true &&
    typeof newColumn.defaultValue === 'string';

  if (updatedNulls) {
    // Replace nulls if necessary
    await queryT.raw(
      `UPDATE "${tableName}" SET "${columnName}"='${newColumn.defaultValue}' WHERE "${columnName}" IS NULL;`,
    );
  }

  // Destroy if necessary
  if (drop) {
    await queryT.delete(tableName);
  } else if (destroy) {
    await queryT.delete(tableName, { [columnName]: null });
  }

  // Change the column definition
  if (isEnum(newColumn)) {
    await migrateEnumColumn(
      wildebeest,
      (newColumn.values || []).reduce(
        (acc, val) => Object.assign(acc, { [val]: val }),
        {},
      ),
      {
        tableName,
        columnName,
        defaultValue: newColumn.defaultValue,
        allowNull: newColumn.allowNull,
      },
      transactionOptions,
    );
  } else {
    await queryInterface.changeColumn(
      tableName,
      columnName,
      newColumn,
      transactionOptions,
    );
  }

  // If migrating away from an enum, remove the enum
  if (isEnum(oldColumn) && !isEnum(newColumn)) {
    await dropEnum(
      wildebeest.db,
      wildebeest.namingConventions.enum(tableName, columnName),
      transactionOptions,
      true, // TODO remove need for cascade on changeColumn enum
    );
  }
}

/**
 * Change the definition of a column
 *
 * @param options - Options for changing a column in a table(s)
 * @returns The change column migrator
 */
export default function changeColumn<TModels extends ModelMap>(
  options: ChangeTableColumnOptions<TModels>,
): MigrationDefinition<TModels> {
  const { tableName, getNewColumn, getOldColumn, ...rest } = options;
  // Convert the tables to modify to a list
  const tableNames: string[] = Array.isArray(tableName)
    ? tableName
    : [tableName];

  return {
    // Change each column forward
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tableNames.map((table) =>
            changeColumnDefinition(
              wildebeest,
              {
                tableName: table,
                getNewColumn,
                getOldColumn,
                ...rest,
              },
              transactionOptions,
            ),
          ),
        ),
      ),
    // Change each column backwards
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tableNames.map((table) =>
            changeColumnDefinition(
              wildebeest,
              {
                tableName: table,
                getOldColumn: getNewColumn,
                getNewColumn: getOldColumn,
                ...rest,
              },
              transactionOptions,
            ),
          ),
        ),
      ),
  };
}
