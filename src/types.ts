/**
 *
 * ## Migrations Type Definitions
 * Type definitions for the migrations container.
 *
 * @module migrations/types
 * @see module:migrations
 */

// external modules
import * as sequelize from 'sequelize';

// local
import Wildebeest from './index';
import { WhereOptions } from './utils/batchProcess';
import { WithTransaction } from './utils/createQueryMaker';
import { RowUpdater, UpdateRowOptions } from './utils/updateRows';

// //// //
// Misc //
// //// //

/**
 * Any array
 */
export type AnyArray = any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

// ///////// //
// Sequelize //
// ///////// //

/**
 * A db model column attribute, adds some extra configs for associations
 */
export type Attribute = sequelize.ModelAttributeColumnOptions & {
  /** Indicates if the column definition is due to an association */
  isAssociation?: boolean;
  /** The association options */
  associationOptions?: sequelize.AssociationOptions;
};

/**
 * The db model column definitions
 */
export type Attributes = { [key in string]: Attribute };

/** Function that returns column definition where key is column name and value is column definition */
/**
 * Function that returns column definition where key is column name and value is column definition
 */
export type DefineColumns = (db: SequelizeMigrator) => Attributes;

/**
 * Custom association options added by wildebeest
 */
export type WildebeestCustomAssociationOptions = {
  /**
   * When true, the association is only used in lookups and is not a 2-way association
   *
   * This is useful when there is a hasMany or belongsToMany association but we only care if there is at least 1
   *
   * (this is really only used with `hasOne`)
   */
  lookupOnly?: boolean;
};

/**
 * A generalized association definition. When the string `CASCADE` is provided, the default options are taken. The default options vary by association type.
 */
export type Association<
  TSequelizeOptions extends sequelize.AssociationOptions = sequelize.AssociationOptions
> = (TSequelizeOptions & WildebeestCustomAssociationOptions) | 'CASCADE';

/**
 * This model belongsTo another model. This adds `{{name}}Id` to this model.
 * Can simply provide the name of the model to take the default options.
 */
export type BelongsToAssociation = Association<sequelize.BelongsToOptions>;

/**
 * This model hasOne of another model. This adds `{{this}}Id` to the association model defined by `name`.
 * Can simply provide the name of the model to take the default options
 */
export type HasOneAssociation = Association<sequelize.HasOneOptions>;

/**
 * This model hasMany of another model. This adds `{{this}}Id` to the association model defined by `name`
 */
export type HasManyAssociation = Association<sequelize.HasManyOptions>;

/**
 * This model belongsToMany of another model. This adds a join table between the models
 */
export type BelongsToManyAssociation = Association<
  sequelize.BelongsToManyOptions
>;

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
  attributes: Attributes;
  /** The associations for that db model */
  associations: Associations;
  /** The sequelize db model options */
  options: sequelize.ModelOptions;
  /** Indicate if the model is a join table and extra checks will be enforced */
  isJoin?: boolean;
  /** You can skip the sync check by setting this to true */
  skip?: boolean;
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
  up: (db: Wildebeest, withTransaction: WithTransaction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (db: Wildebeest, withTransaction: WithTransaction) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
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

// ///////////// //
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
