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

// models
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import Model from '@wildebeest/classes/WildebeestModel';

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

/**
 * Make select arguments of a type required
 */
export type Requirize<T, K extends keyof T> = Omit<T, K> &
  Required<{ [P in K]: T[P] }>;

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
 * A db model column attribute, alias for sequelize options only
 */
export type Attribute = sequelize.ModelAttributeColumnOptions;

/**
 * The db model column definitions, keyed by column name
 */
export type Attributes = { [columnName in string]: Attribute };

/**
 * Once associations have been collapsed into attributes, extra options are added
 */
export type ConfiguredAttribute = Attribute & {
  /** Indicates if the column definition is due to an association */
  isAssociation?: boolean;
  /** The association options */
  associationOptions?: sequelize.AssociationOptions;
};

/**
 * The db model column definitions, keyed by column name
 */
export type ConfiguredAttributes = {
  [columnName in string]: ConfiguredAttribute;
};

/**
 * Function that returns column definition where key is column name and value is column definition
 */
export type DefineColumns<TModels extends ModelMap> = (
  db: WildebeestDb<TModels>,
) => Attributes;

/**
 * Since the keys of the associations object specify the `as`, the `modelName` must be procided when the association name !== modelName
 * to indicate what model the association is referring to.
 */
export type AssociationModelName = {
  /** The name of the model that the association is to */
  modelName?: string;
};

/**
 * This model belongsTo another model. This adds `{{name}}Id` to this model.
 *
 * Providing `modelName` here will infer `as` to be the association key
 *
 * When `NON_NULL` is provided, the options will be set to [NON_NULL]{@link module:constants.NON_NULL} and the association will have an `onDelete: 'CASCADE'`
 */
export type BelongsToAssociation =
  | (sequelize.BelongsToOptions & AssociationModelName)
  | 'NON_NULL';

/**
 * This model hasOne of another model. This adds `{{this}}Id` to the opposing association model.
 *
 * Providing `modelName` here will infer foreignKey to be `${associationKey}Id`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasOneAssociation =
  | (sequelize.HasOneOptions & AssociationModelName)
  | 'CASCADE';

/**
 * This model hasMany of another model. This adds `{{this}}Id` to the association model defined by `name`
 *
 * Providing `modelName` here will infer `as` to be `pluralCase({associationKey})`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasManyAssociation =
  | (sequelize.HasManyOptions & AssociationModelName)
  | 'CASCADE';

/**
 * This model belongsToMany of another model. This adds a join table between the models.
 */
export type BelongsToManyAssociation = Omit<
  sequelize.BelongsToManyOptions,
  'through'
>;

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
  /** The has one associations (adds `thisId` to the association model) */
  hasOne?: { [associationName in string]: HasOneAssociation };
  /** The has many associations (adds `thisId` to the association model) */
  hasMany?: { [associationName in string]: HasManyAssociation };
  /** Indicates there exists a join table with the association */
  belongsToMany?: { [associationName in string]: BelongsToManyAssociation };
};

/**
 * The associations for a converted into standard sequelize options
 */
export type ConfiguredAssociations = {
  /** The belongs to associations (adds `associationId` to the model) */
  belongsTo: {
    [associationName in string]: sequelize.BelongsToOptions &
      Required<AssociationModelName>;
  };
  /** The has one associations (adds `thisId` to the association model) */
  hasOne: {
    [associationName in string]: sequelize.HasOneOptions &
      Required<AssociationModelName>;
  };
  /** The has many associations (adds `thisId` to the association model) */
  hasMany: {
    [associationName in string]: sequelize.HasManyOptions &
      Required<AssociationModelName>;
  };
  /** Indicates there exists a join table with the association */
  belongsToMany: {
    [associationName in string]: sequelize.BelongsToManyOptions;
  };
};

/**
 * A definition of a database model
 */
export type ModelDefinition<
  TModel extends sequelize.Model = sequelize.Model
> = {
  /** The name of the table */
  tableName?: string;
  /** The sequelize db model attribute definitions */
  attributes?: Attributes;
  /** The associations for that db model */
  associations?: Associations;
  /** The sequelize db model options */
  options?: sequelize.ModelOptions<TModel>;
  /** Indicate if the model is a join table and extra checks will be enforced */
  isJoin?: boolean;
  /** You can skip the sync check by setting this to true */
  skip?: boolean;
  /** When ture, this model does not need an opposite hasOne or hasMany association for opposing belongsTo associations */
  dontMatchBelongsTo?: boolean;
};

/**
 * A configured model definition with defaults filled out
 */
export type ConfiguredModelDefinition = Required<
  Omit<ModelDefinition, 'dontMatchBelongTo' | 'associations' | 'attributes'>
> & {
  /** The configured model attributes */
  attributes: ConfiguredAttributes;
  /** The configured sequelize association options */
  associations: ConfiguredAssociations;
  /** Save the initial associations */
  rawAssociations: Required<Associations>;
};

/**
 * Model map definition from model name to model definition
 */
export type ModelMap = { [modelName in string]: typeof Model };

// ///// //
// Umzug //
// ///// //

/**
 * A migration that should run on the db
 */
export type MigrationDefinition<TModels extends ModelMap> = {
  /** The up migration (there should be no loss of data) */
  up: (
    wildebeest: Wildebeest<TModels>,
    withTransaction: WithTransaction<TModels>,
  ) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any,max-len
  /** The down migration to reverse the up migration, with potential loss of data */
  down: (
    wildebeest: Wildebeest<TModels>,
    withTransaction: WithTransaction<TModels>,
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
export type QueryHelpers<TModels extends ModelMap> = {
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
    getRowDefaults: RowUpdater<T, TModels>,
    columnDefinitions: Attributes,
    options: UpdateRowOptions<T>,
  ) => Promise<number>;
};

/**
 * Transaction options when running a migration come with helper functions
 */
export type MigrationTransactionOptions<TModels extends ModelMap> = {
  /** Helper functions that run within the migration transaction */
  queryT: QueryHelpers<TModels>;
  /** The transaction itself */
  transaction: sequelize.Transaction;
};

// /////// //
// Express //
// /////// //

/**
 * Wildebeest is mounted onto res.locals
 */
export type WildebeestResponse<TModels extends ModelMap> = Omit<
  express.Response,
  'locals'
> & {
  /** Local values accessesible in controller functions */
  locals: {
    /** The wildebeest migrator */
    wildebeest: Wildebeest<TModels>;
  };
};
