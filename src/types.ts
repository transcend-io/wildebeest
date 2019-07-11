/**
 *
 * ## Migrations Type Definitions
 * Type definitions for the migrations container.
 *
 * @module migrations/types
 * @see module:migrations
 */

// external modules
import * as express from 'express';
import * as sequelize from 'sequelize';
import * as umzug from 'umzug';

// local
import { IndexType } from './enums';
import Wildebeest from './index';
import { WhereOptions } from './utils/batchProcess';
import { WithTransaction } from './utils/createQueryMaker';
import { RowUpdater, UpdateRowOptions } from './utils/updateRows';

// //// //
// Misc //
// //// //

/**
 * Any array, useful for extending purposes
 */
export type AnyArray = any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

// ///////// //
// Sequelize //
// ///////// //

/**
 * Input for creating a new index
 */
export type IndexConfig = {
  /** The type of index */
  type: IndexType;
  /** The name of the index */
  name: string;
};

/**
 * A db model column attribute, adds some extra configs for associations
 * TODO
 */
export type Attribute = sequelize.ModelAttributeColumnOptions;

//  & {
//   /** Indicates if the column definition is due to an association */
//   isAssociation?: boolean;
//   /** The association options */
//   associationOptions?: sequelize.AssociationOptions;
// };

/**
 * The db model column definitions, keyed by column name
 */
export type Attributes = { [columnName in string]: Attribute };

/**
 * Function that returns column definition where key is column name and value is column definition
 */
export type DefineColumns = (db: SequelizeMigrator) => Attributes;

/**
 * This model belongsTo another model. This adds `{{name}}Id` to this model.
 *
 * When `CASCADE` is provided, the options will be set to [NON_NULL]{@link module:constants.NON_NULL}
 */
export type BelongsToAssociation = sequelize.BelongsToOptions | 'CASCADE';

/**
 * This model hasOne of another model. This adds `{{this}}Id` to the opposing association model.
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasOneAssociation = sequelize.HasOneOptions | 'CASCADE';

/**
 * This model hasMany of another model. This adds `{{this}}Id` to the association model defined by `name`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasManyAssociation = sequelize.HasManyOptions | 'CASCADE';

/**
 * This model belongsToMany of another model. This adds a join table between the models.
 */
export type BelongsToManyAssociation = sequelize.BelongsToManyOptions;

/**
 * The intersection of all of the different association types
 */
export type Association =
  | BelongsToAssociation
  | HasOneAssociation
  | HasManyAssociation
  | BelongsToManyAssociation;

/**
 * The associations for a model
 */
export type Associations = {
  /** The belongs to associations (adds `associationId` to the model) */
  belongsTo?: { [associationName in string]: BelongsToAssociation };
  /** The has one associations (adds  `thisId` to the association model) */
  hasOne?: { [associationName in string]: HasOneAssociation };
  /** The has many associations (adds  `thisId` to the association model) */
  hasMany?: { [associationName in string]: HasManyAssociation };
  /** Indicates there exists a join table with the association */
  belongsToMany?: { [associationName in string]: BelongsToManyAssociation };
};

/**
 * A definition of a database model
 */
export type ModelDefinition = {
  /** The name of the table */
  tableName: string;
  /** The sequelize db model attribute definitions */
  attributes?: Attributes;
  /** The associations for that db model */
  associations?: Associations;
  /** The sequelize db model options */
  options?: sequelize.ModelOptions;
  /** Indicate if the model is a join table and extra checks will be enforced */
  isJoin?: boolean;
  /** You can skip the sync check by setting this to true */
  skip?: boolean;
  /** When ture, this model does not need an opposite hasOne or hasMany association for opposing belongsTo associations */
  dontMatchBelongsTo?: boolean;
};

// ///// //
// Umzug //
// ///// //

/**
 * Foreign key constraint definition for a table column
 */
export type SequelizeMigrator = sequelize.Sequelize & {
  /** No need to call getter to access queryInterface during migrations */
  queryInterface: sequelize.QueryInterface;
  /** The data types */
  DataTypes: typeof sequelize.DataTypes;
};

/**
 * A migration that should run on the db
 */
export type MigrationDefinition = {
  /** The up migration (there should be no loss of data) */
  up: (
    wildebeest: Wildebeest,
    withTransaction: WithTransaction,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (
    wildebeest: Wildebeest,
    withTransaction: WithTransaction,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
};

/**
 * A definition for a migration file
 */
export type MigrationConfig = {
  /** The migration count */
  numInt: number;
  /** The migration count as a string */
  num: string;
  /** The migration name with the count */
  name: string;
  /** The name of the file */
  fileName: string;
  /** The full path to the file */
  fullPath: string;
};

/**
 * Custom up to
 */
export type UpToOptions = Partial<umzug.UpToOptions> & {
  /** Umzug types are missing from */
  from?: string;
};

// //////////// //
// Transactions //
// //////////// //

/**
 * Run a query with a transaction
 */
export type QueryWithTransaction = <T extends AnyArray = AnyArray>(
  q: string,
) => PromiseLike<T>;

/**
 * The helper functions wrapped in transactions
 */
export type QueryHelpers = {
  /** Run a SELECT query in the transaction that returns a list */
  select: QueryWithTransaction;
  /** Delete rows inside the transaction */
  delete: (
    tableName: string,
    identifier?: sequelize.WhereOptions,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** Insert rows inside the transaction */
  insert: <TInput extends {}>(
    tableName: string,
    records: TInput[],
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  /** A raw SQL query returning metadata as well */
  raw: QueryWithTransaction;
  /** Batch process in the same transaction */
  batchProcess: <T extends {}>(
    tableName: string,
    whereOptions: WhereOptions,
    processRow: (row: T) => void,
  ) => Promise<number>;
  /** Batch update a table */
  batchUpdate: <T extends {}>(
    tableName: string,
    getRowDefaults: RowUpdater<T>,
    columnDefinitions: Attributes,
    options: UpdateRowOptions<T>,
  ) => Promise<number>;
};

/**
 * Transaction options when running a migration come with helper functions
 */
export type MigrationTransactionOptions = {
  /** Helper functions that run within the migration transaction */
  queryT: QueryHelpers;
  /** The transaction itself */
  transaction: sequelize.Transaction;
};

// /////// //
// Express //
// /////// //

/**
 * Wildebeest is mounted onto res.locals
 */
export type WildebeestResponse = Omit<express.Response, 'locals'> & {
  /** Local values accessesible in controller functions */
  locals: {
    /** The wildebeest migrator */
    wildebeest: Wildebeest;
  };
};
