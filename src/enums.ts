/**
 *
 * ## Wildebeest Enums
 * Common enums.
 *
 * @module enums
 * @see module:wildebeest
 */

// global
import mkEnum from '@wildebeest/utils/mkEnum';

/**
 * The supported postgres index types
 */
export enum IndexType {
  /** An index on a primary key */
  PrimaryKey = 'primary key',
  /** A column or set of columns that are unique */
  Unique = 'unique',
  /** (default) A regular database index */
  Index = 'index',
}

/**
 * The supported postgres index methods
 */
export enum IndexMethod {
  /** A binary tree index */
  BTree = 'BTREE',
  /** A hash index */
  Hash = 'HASH',
  /** Gist index */
  Gist = 'GIST',
  /** Gin index */
  Gin = 'GIN',
  /** Sp gist index */
  SPGist = 'SPGIST',
  /** Brin index */
  Brin = 'BRIN',
}

/**
 * The names of the db models can be overwritten
 */
export const DefaultTableNames = mkEnum({
  migrationLock: 'migrationLocks',
  migration: 'migrations',
});

/**
 * Possible options on association model delete
 */
export const OnDelete = mkEnum({
  /** Cascade the deletion to this table */
  Cascade: 'CASCADE',
  /** Set the column to null */
  SetNull: 'SET NULL',
  /** Do nothing (often not used) */
  NoAction: 'NO ACTION',
});

/**
 * Overload with type of on delete
 */
export type OnDelete = (typeof OnDelete)[keyof typeof OnDelete];
