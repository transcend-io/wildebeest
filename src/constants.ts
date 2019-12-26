// external modules
import { snakeCase } from 'change-case';
import { ModelIndexesOptions } from 'sequelize';

/**
 * Postgres has a limit on constraint names
 */
export const MAX_CONSTRAINT_NAME = 63;

/**
 * One can override the naming conventions for various database values
 */
export const DEFAULT_NAMING_CONVENTIONS = {
  /**
   * An index on a column
   */
  columnIndex: (tableName: string, columnName: string): string =>
    columnName === 'id'
      ? `${tableName}_pkey`
      : `${tableName}_${columnName}_key`,
  /**
   * A foreign key constraint on a column
   */
  foreignKeyConstraint: (tableName: string, columnName: string): string =>
    `${tableName}_${columnName}_fkey`,
  /**
   * A unique constraint on a single column
   */
  uniqueConstraint: (tableName: string, columnName: string): string =>
    `${tableName}_${columnName}_key`,
  /**
   * The name of an enum
   */
  enum: (tableName: string, columnName: string): string =>
    `enum_${tableName}_${columnName}`,
  /**
   * A unique constraint across a number of columns
   */
  fieldsConstraint: (
    tableName: string,
    fields: Required<ModelIndexesOptions>['fields'],
  ): string =>
    `${snakeCase(tableName)}_${fields
      .map((word) => snakeCase(typeof word === 'string' ? word : word.name))
      .join('_')}`,
  /**
   * The primary key of the model
   */
  primaryKey: (tableName: string): string => `${tableName}_pkey`,
};

/**
 * Add hooks: true onDelete: cascade
 */
export const CASCADE_HOOKS = {
  hooks: true,
  onDelete: 'cascade',
};

/**
 * Make the foreignKey be NOT NULL
 */
export const NON_NULL = { foreignKey: { allowNull: false } };

/**
 * The maximum number of migrations to show on a page
 */
export const MAX_MIGRATION_DISPLAY = 30;

/**
 * True if NODE_ENV=test
 */
export const IS_TEST = process.env.NODE_ENV === 'test';

/**
 * One second of time in ms
 */
export const ONE_SECOND = 1000;

/**
 * One minute of time in ms
 */
export const ONE_MINUTE = 60 * ONE_SECOND;

/**
 * The maximum number of times to attempt to acquire the migration lock.
 */
export const MAX_LOCK_ATTEMPTS = 20;

/**
 * The maximum random timeout that should occur between attempts to acquire the migration lock
 */
export const MIGRATION_TIMEOUT = ONE_SECOND * 5;

/**
 * The exit events to handle
 */
export const EXIT_EVENTS = [
  'exit',
  'SIGINT',
  'SIGUSR1',
  'SIGUSR2',
  'uncaughtException',
  'SIGTERM',
];

/**
 * Skip these strings when logging
 */
export const LOG_SKIPS = [
  'File:  does not match pattern:',
  'File: does not match pattern:',
  'File: index.js does not match pattern:',
  '.map does not match pattern:',
];
