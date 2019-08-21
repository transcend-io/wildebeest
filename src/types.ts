/* eslint-disable max-lines */
/**
 *
 * ## Wildebeest Type Definitions
 * Type definitions
 *
 * @module wildebeest/types
 * @see module:migrations
 */

// external modules
import * as express from 'express';
import * as sequelize from 'sequelize';
import { HookReturn, ModelHooks } from 'sequelize/types/lib/hooks';
import * as umzug from 'umzug';

// models
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import WildebeestModel from '@wildebeest/classes/WildebeestModel';

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
 * To make the inspected type more tractable than a bunch of intersections
 */
export type Identity<T> = { [K in keyof T]: T[K] };

/**
 * Make select arguments of a type required
 */
export type Requirize<T, K extends keyof T> = Omit<T, K> &
  Required<{ [P in K]: T[P] }>;

/**
 * An object keyed by strings
 */
export type ObjByString = { [key in string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Make selected object keys defined by K optional in type T
 */
export type Optionalize<T, K extends keyof T> = Identity<
  Omit<T, K> & Partial<T>
>;

/**
 * Merge an object of objects into a single object
 */
export type Merge<TObj extends ObjByString> = UnionToIntersection<
  TObj[keyof TObj]
>;

/**
 * Extract string keys from an object
 */
export type StringKeys<TObj extends ObjByString> = Extract<keyof TObj, string>;

/**
 * Filter object for values that do not extend some condition
 */
export type SubNotType<Base, Condition> = Pick<
  Base,
  { [Key in keyof Base]: Base[Key] extends Condition ? never : Key }[keyof Base]
>;

/**
 * Convert unions to intersection
 */
export type UnionToIntersection<U> = (U extends any // eslint-disable-line @typescript-eslint/no-explicit-any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never;

/**
 * Soft spread
 */
export type Spread<L, R> = Identity<
  // Properties in L that don't exist in R
  Pick<L, Exclude<keyof L, keyof R>> & R
>;

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
 * Attribute inputs are not typed yet TODO
 */
export type AttributeInputs = { [name in string]: unknown };

/**
 * The db model column definitions, keyed by column name
 */
export type Attributes = { [columnName in string]: Attribute };

/**
 * Convert an attribute definition to a type
 */
export type AttributeToType<
  TAttribute extends Attribute
> = TAttribute['type'] extends typeof sequelize.DataTypes.INTEGER
  ? number
  : TAttribute['type'] extends typeof sequelize.DataTypes.DATE
  ? Date
  : TAttribute['type'] extends typeof sequelize.DataTypes.STRING
  ? string
  : TAttribute['type'] extends sequelize.DataTypeAbstract
  ? (TAttribute['defaultValue'] extends boolean
      ? boolean
      : TAttribute['defaultValue'] extends typeof sequelize.UUIDV4
      ? string // TODO ID<>
      : unknown)
  : unknown;

/**
 * Take the attribute definitions and extract out the typings that should be assigned to the db model but make them all required
 */
export type ExtractRequiredAttributes<TAttributes extends Attributes> = {
  [k in StringKeys<TAttributes>]: AttributeToType<TAttributes[k]>;
};

/**
 * Take the attribute definitions and extract out the typings that should be assigned to the db model
 */
export type ExtractAttributes<TAttributes extends Attributes> = Identity<
  ExtractRequiredAttributes<
    SubNotType<
      TAttributes,
      {
        /** Filter out values that are allowed to be null */
        allowNull: true;
      }
    >
  > &
    Partial<ExtractRequiredAttributes<TAttributes>>
>;

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
export type DefineColumns<
  TModels extends ModelMap,
  TAttributes extends Attributes
> = (db: WildebeestDb<TModels>) => TAttributes;

/**
 * Since the keys of the associations object specify the `as`, the `modelName` must be provided when the association name !== modelName
 * to indicate what model the association is referring to.
 */
export type AssociationModelName<TModelName extends string> = {
  /** The name of the model that the association is to */
  modelName?: TModelName;
};

/**
 * This model belongsTo another model. This adds `{{name}}Id` to this model.
 *
 * Providing `modelName` here will infer `as` to be the association key
 *
 * When `NON_NULL` is provided, the options will be set to [NON_NULL]{@link module:constants.NON_NULL} and the association will have an `onDelete: 'CASCADE'`
 */
export type BelongsToAssociation<TModelName extends string> =
  | (sequelize.BelongsToOptions & AssociationModelName<TModelName>)
  | 'NON_NULL';

/**
 * This model hasOne of another model. This adds `{{this}}Id` to the opposing association model.
 *
 * Providing `modelName` here will infer foreignKey to be `${associationKey}Id`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasOneAssociation<TModelName extends string> =
  | (sequelize.HasOneOptions & AssociationModelName<TModelName>)
  | 'CASCADE';

/**
 * This model hasMany of another model. This adds `{{this}}Id` to the association model defined by `name`
 *
 * Providing `modelName` here will infer `as` to be `pluralCase({associationKey})`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasManyAssociation<TModelName extends string> =
  | (sequelize.HasManyOptions & AssociationModelName<TModelName>)
  | 'CASCADE';

/**
 * This model belongsToMany of another model. This adds a join table between the models.
 */
export type BelongsToManyAssociation<TModelName extends string> = Omit<
  sequelize.BelongsToManyOptions,
  'through'
> & {
  /** The name of the model joining through */
  throughModelName: TModelName;
};

/**
 * The intersection of all of the different association types
 */
export type Association<TModelName extends string> =
  | BelongsToAssociation<TModelName>
  | HasOneAssociation<TModelName>
  | HasManyAssociation<TModelName>
  | BelongsToManyAssociation<TModelName>;

/**
 * The associations for a model
 */
export type Associations<TModelNames extends string = StringKeys<ModelMap>> = {
  /** The belongs to associations (adds `associationId` to the model) */
  belongsTo?: {
    [associationName in string]: BelongsToAssociation<TModelNames>;
  };
  /** The has one associations (adds `thisId` to the association model) */
  hasOne?: { [associationName in string]: HasOneAssociation<TModelNames> };
  /** The has many associations (adds `thisId` to the association model) */
  hasMany?: { [associationName in string]: HasManyAssociation<TModelNames> };
  /** Indicates there exists a join table with the association */
  belongsToMany?: {
    [associationName in string]: BelongsToManyAssociation<TModelNames>;
  }; // TODO [string in TModelName]
};

/**
 * The associations for a converted into standard sequelize options
 */
export type ConfiguredAssociations<TModelNames extends string> = {
  /** The belongs to associations (adds `associationId` to the model) */
  belongsTo: {
    [associationName in string]: sequelize.BelongsToOptions &
      Required<AssociationModelName<TModelNames>>;
  };
  /** The has one associations (adds `thisId` to the association model) */
  hasOne: {
    [associationName in string]: sequelize.HasOneOptions &
      Required<AssociationModelName<TModelNames>>;
  };
  /** The has many associations (adds `thisId` to the association model) */
  hasMany: {
    [associationName in string]: sequelize.HasManyOptions &
      Required<AssociationModelName<TModelNames>>;
  };
  /** Indicates there exists a join table with the association */
  belongsToMany: {
    [associationName in string]: sequelize.BelongsToManyOptions;
  }; // TODO [string in TModelName]
};

/**
 * A definition of a database model
 */
export type ModelDefinition<
  TModelNames extends string,
  TModel extends sequelize.Model = sequelize.Model
> = {
  /** The name of the table */
  tableName?: string;
  /** The sequelize db model attribute definitions */
  attributes?: Attributes;
  /** The default attributes to add to every model (ID, createdAt, updatedAt), set this to remove these columns */
  defaultAttributes?: Attributes;
  /** The associations for that db model */
  associations?: Associations<TModelNames>;
  /** The sequelize db model options */
  options?: sequelize.ModelOptions<TModel>;
  /** Indicate if the model is a join table and extra checks will be enforced */
  isJoin?: boolean;
  /** You can skip the sync check by setting this to true */
  skip?: boolean;
  /** When true, this model does not need an opposite hasOne or hasMany association for opposing belongsTo associations */
  dontMatchBelongsTo?: boolean;
};

/**
 * A configured model definition with defaults filled out
 */
export type ConfiguredModelDefinition<
  TModelNames extends string,
  TModel extends sequelize.Model = sequelize.Model
> = Required<
  Omit<
    ModelDefinition<TModelNames, TModel>,
    'dontMatchBelongTo' | 'associations' | 'attributes'
  >
> & {
  /** The configured model attributes */
  attributes: ConfiguredAttributes;
  /** The configured sequelize association options */
  associations: ConfiguredAssociations<TModelNames>;
  /** Save the initial associations */
  rawAssociations: Required<Associations<TModelNames>>;
};

/**
 * Model map definition from model name to model definition
 */
export type ModelMapConstructor<
  TConstructorClass extends typeof WildebeestModel
> = {
  [modelName in string]: TConstructorClass;
};

/**
 * Any model map, arbitrary of class constructor
 */
export type ModelMap = ModelMapConstructor<any>;

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
export type QueryHelpers<
  TModels extends ModelMap,
  TAttributes extends Attributes
> = {
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
  batchUpdate: (
    tableName: string,
    getRowDefaults: RowUpdater<TModels, TAttributes>,
    columnDefinitions: TAttributes,
    options: UpdateRowOptions,
  ) => Promise<number>;
};

/**
 * Options for running a query with a transaction
 */
export type TransactionOptions = {
  /** The database transaction */
  transaction: sequelize.Transaction;
};

/**
 * Transaction options when running a migration come with helper functions
 */
export type MigrationTransactionOptions<
  TModels extends ModelMap,
  TAttributes extends Attributes = Attributes
> = {
  /** Helper functions that run within the migration transaction */
  queryT: QueryHelpers<TModels, TAttributes>;
} & TransactionOptions;

// ///// //
// Hooks //
// ///// //

/**
 * Db model hooks
 */
export type HookOptions<M extends WildebeestModel<ModelMap>> = Partial<
  Spread<
    ModelHooks<M>,
    {
      /** Before row is created */
      beforeCreate(
        attributes: M,
        options?: MergedHookOptions<M, 'create'>,
      ): HookReturn;
      /** After row is created */
      afterCreate(
        attributes: M,
        options?: MergedHookOptions<M, 'create'>,
      ): HookReturn;
      /** Before row is destroyed */
      beforeDestroy(
        instance: M,
        options?: MergedHookOptions<M, 'destroy'>,
      ): HookReturn;
      /** After row is destroyed */
      afterDestroy(
        instance: M,
        options?: MergedHookOptions<M, 'destroy'>,
      ): HookReturn;
      /** Before row is updated */
      beforeUpdate(
        instance: M,
        options?: MergedHookOptions<M, 'update'>,
      ): HookReturn;
      /** After row is updated */
      afterUpdate(
        instance: M,
        options?: MergedHookOptions<M, 'update'>,
      ): HookReturn;
    }
  >
>;

/**
 * Any additional options required or allowed in hooks
 */
export type HookExtraOptions = {
  /** Before and after a row is created */
  create?: {};
  /** Before and after a row is updated */
  update?: {};
  /** Before an after a row is destroyed */
  destroy?: {};
};

/**
 * The default options for each category of hook
 */
export type HookDefaultOptions = {
  /** Create a new instance */
  create: sequelize.CreateOptions;
  /** Update an existing instance */
  update: sequelize.InstanceUpdateOptions;
  /** Destroy an instance */
  destroy: sequelize.DestroyOptions;
};

/**
 * Construct the hook options by combining existing with custom
 */
export type MergedHookOptions<
  TModel extends WildebeestModel<ModelMap>,
  THook extends keyof HookExtraOptions
> = TModel['hookOptionsT'][THook] extends {} | undefined
  ? HookDefaultOptions[THook]
  : TModel['hookOptionsT'][THook] & HookDefaultOptions[THook];

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
  /** Local values accessible in controller functions */
  locals: {
    /** The wildebeest migrator */
    wildebeest: Wildebeest<TModels>;
  };
};

// //// //
// Sync //
// //// //

/**
 * An error report when checking the sync status of postgres and sequelize
 */
export type SyncError = {
  /** The error message */
  message: string;
  /** The name (or names) of the related db models */
  tableName: string;
};
