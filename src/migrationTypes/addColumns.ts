/* eslint-disable max-lines */
// external modules
import difference from 'lodash/difference';
import { DataType, ModelAttributeColumnOptions, WhereOptions } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { OnDelete } from '@wildebeest/enums';
import {
  DefineColumns,
  MigrationDefinition,
  MigrationTransactionOptions,
  ModelMap,
} from '@wildebeest/types';
import {
  addTableColumnConstraint,
  dropEnum,
  isEnum,
  migrateEnumColumn,
} from '@wildebeest/utils';
import indexConstraints, {
  ColumnConstraint,
  RawConstraint,
} from '@wildebeest/utils/indexConstraints';
import { RowUpdater } from '@wildebeest/utils/updateRows';

/**
 * Options for adding new columns to a single table
 */
export type AddTableColumnsOptions<T extends {}, TModels extends ModelMap> = {
  /** The name of the table */
  tableName: string;
  /** Function that returns column definition where key is column name and value is column definition */
  getColumns: DefineColumns<TModels>;
  /** The foreign key constraints. When a string, it refers to the name of the column and table is calculated by pascalCase(removeId(columnName)) */
  constraints?: RawConstraint[];
  /** Drop the table values first. True means drop all rows. Can also specify the where options to drop */
  drop?: boolean | WhereOptions;
  /**  When migrating a table with data in it, write a function that takes in a db row and returns the new defaults for that row */
  getRowDefaults?: RowUpdater<T, TModels>;
  /** The constraint on delete (SET NULL is default) */
  onDelete?: OnDelete;
  /** The name of the id column */
  idName?: Extract<keyof T, string>;
  /** What to return when no default value is defined */
  onNullValue?: () => any; // TODO remove
};

/**
 * Options for adding a single column to a single table
 */
export type AddTableColumnOptions<T extends {}> = {
  /** The name of the table */
  tableName: string;
  /** The column definition */
  column: ModelAttributeColumnOptions;
  /** The name of the column */
  columnName: string;
  /** The foreign key constraint definition */
  constraint?: ColumnConstraint;
  /** The constraint on delete (SET NULL is default) */
  onDelete?: OnDelete;
  /** The name of the id column */
  idName?: Extract<keyof T, string>;
  /** What to return when no default value is defined */
  onNullValue?: () => any; // TODO remove
};

/**
 * Options for adding new columns to a table
 */
export type AddColumnsOptions<T, TModels extends ModelMap> = Omit<
  AddTableColumnsOptions<T, TModels>,
  'tableName'
> & {
  /** The name of the table */
  tableName: string | string[];
};

/**
 * Add a new column to an existing table
 *
 * @param wildebeest - The wildebeest configuration
 * @param options - The options for adding a new column to a table
 * @param transactionOptions - The current transaction
 * @returns The add column promise
 */
export async function addColumn<T extends {}, TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: AddTableColumnOptions<T>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const { tableName, columnName, column } = options;
  // Pull apart column config
  const { queryInterface } = wildebeest.db;

  // Drop old enum if still exists
  if (isEnum(column)) {
    await dropEnum(
      wildebeest.db,
      wildebeest.namingConventions.enum(tableName, columnName),
      transactionOptions,
    );
  }

  // Add the column with the pre-definition
  await queryInterface.addColumn(
    tableName,
    columnName,
    column,
    transactionOptions,
  );
}

/**
 * Set column definition with possible constraint
 *
 * @param wildebeest - The wildebeest configuration
 * @param options - The options for adding a new column to a table
 * @param transactionOptions - The current transaction
 * @returns The add column promise
 */
export async function setColumn<T extends {}, TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: AddTableColumnOptions<T>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const {
    tableName,
    columnName,
    column,
    constraint,
    onDelete = 'SET NULL', // TODO constant
  } = options;
  // Pull apart column config
  const { queryInterface } = wildebeest.db;
  const { allowNull, defaultValue, ...rest } = column;

  /**
   * Type cast to values that may not exist
   */
  type WithValues = DataType & {
    /** Enum values */
    values: string[];
  };

  // Change enum column if an enum
  if (isEnum(column)) {
    const enumValue: {
      [k in string]: string;
    } = (rest.values || (rest.type as WithValues).values).reduce(
      (acc, val) => Object.assign(acc, { [val]: val }),
      {},
    );
    await migrateEnumColumn(
      wildebeest,
      enumValue,
      {
        tableName,
        columnName,
        defaultValue,
        allowNull,
      },
      transactionOptions,
    );
  } else {
    // Change column definition to actual
    await queryInterface.changeColumn(
      tableName,
      columnName,
      column,
      transactionOptions,
    );
  }

  // Add a cascade constraint
  if (constraint) {
    await addTableColumnConstraint(
      wildebeest,
      {
        tableName,
        columnName: constraint.columnName,
        constraintOptions: {
          type: 'foreign key',
          onDelete,
          onUpdate: 'cascade',
          ...(!constraint.tableName
            ? {}
            : {
                references: {
                  table: constraint.tableName,
                  field: constraint.foreignColumnName || 'id',
                },
              }),
        },
      },
      transactionOptions,
    );
  }
}

/**
 * Determine whether drop should be called
 *
 * @param drop - The drop option
 * @param columnDefinitions - The columns to add or remove
 * @param isCreate - Indicates calling before create, else calling before destroy
 * @returns True if should call the row delete
 */
export function shouldDrop(
  drop: boolean | WhereOptions | undefined,
  columnDefinitions: { [name in string]: ModelAttributeColumnOptions },
  isCreate: boolean,
): boolean {
  if (!drop) {
    return false;
  }

  // Always drop when boolean
  if (drop && typeof drop === 'boolean') {
    return drop;
  }

  // When removing columns, the drop option is always valid
  if (!isCreate) {
    return !!drop;
  }

  // When adding columns, only call drop if where options don't include the new columns
  const usingCols = Object.keys(drop);
  const newCols = Object.keys(columnDefinitions);

  return difference(usingCols, newCols).length === usingCols.length;
}

/**
 * Remove a column from a table
 *
 * @param wildebeest - The wildebeest configuration
 * @param options - The remove column options
 * @param transactionOptions - The current transaction
 * @returns The remove column promise
 */
export async function removeColumn<T extends {}, TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: AddTableColumnOptions<T>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  // Raw query interface
  const { queryInterface } = wildebeest.db;
  const { tableName, columnName, column } = options;

  // Remove the column
  await queryInterface.removeColumn(tableName, columnName, transactionOptions);

  // If the column is an enum, drop the enum
  if (isEnum(column)) {
    await dropEnum(
      wildebeest.db,
      wildebeest.namingConventions.enum(tableName, columnName),
      transactionOptions,
    );
  }
}

/**
 * Add columns to a table by performing the following operations:
 *
 * 1. If drop=true, drop all rows from the table
 * 2. Create the columns with allowNull=true
 * 3. If getRowDefaults provided, paginate over the table and set the default values
 * 4. Set back the column definition to have the proper allowNull
 *
 * @param wildebeest - The wildebeest config
 * @param options - The add table column options
 * @param transactionOptions - The current transaction
 * @returns The add column promise
 */
export async function addTableColumns<T extends {}, TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: AddTableColumnsOptions<T, TModels>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const { queryT } = transactionOptions;
  const {
    getColumns,
    drop,
    tableName,
    onNullValue,
    idName = 'id',
    constraints = [],
    getRowDefaults,
    onDelete,
  } = options;

  // Index constraints so the can be looked up by columnName
  const lookupConstraint = indexConstraints(constraints);

  // Calculate the column definitions
  const columnDefinitions = getColumns(wildebeest.db);

  // Drop all table rows if specified
  if (shouldDrop(drop, columnDefinitions, true)) {
    await queryT.delete(tableName, typeof drop === 'boolean' ? {} : drop);
  }

  // Create the columns in the database
  await Promise.all(
    Object.entries(columnDefinitions).map(([columnName, column]) =>
      addColumn(
        wildebeest,
        {
          tableName,
          columnName,
          column: { ...column, allowNull: true },
          constraint: lookupConstraint[columnName],
        },
        transactionOptions,
      ),
    ),
  );

  // When provided, set the default values for the new null columns
  if (getRowDefaults) {
    await queryT.batchUpdate<T>(tableName, getRowDefaults, columnDefinitions, {
      idName: idName as Extract<keyof T, string>,
      onNullValue,
    });
  }

  // Set to actual definition and add constraint if necessary
  await Promise.all(
    Object.entries(columnDefinitions).map(([columnName, column]) =>
      setColumn(
        wildebeest,
        {
          tableName,
          columnName,
          column,
          constraint: lookupConstraint[columnName],
          onDelete,
        },
        transactionOptions,
      ),
    ),
  );
}

/**
 * Remove columns from a table
 *
 * 1. If drop=true, drop all rows from the table
 * 2. Remove the columns
 *
 * @param wildebeest - The wildebeest config
 * @param options - The remove table column options
 * @param transactionOptions - The current transaction
 * @returns The add column promise
 */
export async function removeTableColumns<
  T extends {},
  TModels extends ModelMap
>(
  wildebeest: Wildebeest<TModels>,
  options: AddTableColumnsOptions<T, TModels>,
  transactionOptions: MigrationTransactionOptions<TModels>,
): Promise<void> {
  const { queryT } = transactionOptions;
  const { getColumns, drop, tableName } = options;

  // Calculate the column definitions
  const columnDefinitions = getColumns(wildebeest.db);

  // Drop all table rows if specified
  if (shouldDrop(drop, columnDefinitions, false)) {
    await queryT.delete(tableName, typeof drop === 'boolean' ? {} : drop);
  }

  // Create the columns in the database
  await Promise.all(
    Object.entries(columnDefinitions).map(([columnName, column]) =>
      removeColumn(
        wildebeest,
        {
          tableName,
          columnName,
          column,
        },
        transactionOptions,
      ),
    ),
  );
}

/**
 * Create a migration that adds multiple columns on upn and removes them on down
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for adding new columns to a table
 * @returns The add columns migrator
 */
export default function addColumns<T extends {}, TModels extends ModelMap>(
  options: AddColumnsOptions<T, TModels>,
): MigrationDefinition<TModels> {
  const { tableName, ...rest } = options;
  // List of tables
  const tablesNames = Array.isArray(tableName) ? tableName : [tableName];

  return {
    // Drop the table first if var set
    up: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tablesNames.map((table) =>
            addTableColumns(
              wildebeest,
              { tableName: table, ...rest },
              transactionOptions,
            ),
          ),
        ),
      ),
    down: async (wildebeest, withTransaction) =>
      withTransaction((transactionOptions) =>
        Promise.all(
          tablesNames.map((table) =>
            removeTableColumns(
              wildebeest,
              { tableName: table, ...rest },
              transactionOptions,
            ),
          ),
        ),
      ),
  };
}
