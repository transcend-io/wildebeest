/* eslint-disable max-lines */
// external
import * as express from 'express';
import * as sequelize from 'sequelize';
import { HookReturn, ModelHooks } from 'sequelize/types/lib/hooks';
import { ValidationOptions } from 'sequelize/types/lib/instance-validator';
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
 * Extract the sub types of an object, based on some condition.
 *
 * In other words, given an object with mixed value types, filter the key-value pairs to only
 * contain values that extend `Condition`
 */
export type SubType<Base, Condition> = Pick<
  Base,
  { [Key in keyof Base]: Base[Key] extends Condition ? Key : never }[keyof Base]
>;

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
export type UnionToIntersection<U> = (
  U extends any // eslint-disable-line @typescript-eslint/no-explicit-any
    ? (k: U) => void
    : never
) extends (k: infer I) => void
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
  ? TAttribute['defaultValue'] extends boolean
    ? boolean
    : TAttribute['defaultValue'] extends typeof sequelize.UUIDV4
    ? string // TODO ID<>
    : unknown
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
export type DefineColumns<TAttributes extends Attributes> = (
  db: WildebeestDb,
) => TAttributes;

/**
 * Since the keys of the associations object specify the `as`, the `modelName` must be provided when the association name !== modelName
 * to indicate what model the association is referring to.
 */
export type AssociationModelName<TModelName extends WildebeestModelName> = {
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
export type BelongsToAssociation<TModelName extends WildebeestModelName> =
  | (sequelize.BelongsToOptions & AssociationModelName<TModelName>)
  | 'NON_NULL';

/**
 * This model hasOne of another model. This adds `{{this}}Id` to the opposing association model.
 *
 * Providing `modelName` here will infer foreignKey to be `${associationKey}Id`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasOneAssociation<TModelName extends WildebeestModelName> =
  | (sequelize.HasOneOptions & AssociationModelName<TModelName>)
  | 'CASCADE';

/**
 * This model hasMany of another model. This adds `{{this}}Id` to the association model defined by `name`
 *
 * Providing `modelName` here will infer `as` to be `pluralCase({associationKey})`
 *
 * When `CASCADE` is provided, the options will be set to [CASCADE_HOOKS]{@link module:constants.CASCADE_HOOKS}
 */
export type HasManyAssociation<TModelName extends WildebeestModelName> =
  | (sequelize.HasManyOptions & AssociationModelName<TModelName>)
  | 'CASCADE';

/**
 * This model belongsToMany of another model. This adds a join table between the models.
 */
export type BelongsToManyAssociation<
  TModelName extends WildebeestModelName
> = Omit<sequelize.BelongsToManyOptions, 'through'> & {
  /** The name of the model joining through */
  throughModelName: TModelName;
};

/**
 * The intersection of all of the different association types
 */
export type Association<TModelName extends WildebeestModelName> =
  | BelongsToAssociation<TModelName>
  | HasOneAssociation<TModelName>
  | HasManyAssociation<TModelName>
  | BelongsToManyAssociation<TModelName>;

/**
 * The associations for a model
 */
export type Associations = {
  /** The belongs to associations (adds `associationId` to the model) */
  belongsTo?: {
    [associationName in string]: BelongsToAssociation<WildebeestModelName>;
  };
  /** The has one associations (adds `thisId` to the association model) */
  hasOne?: {
    [associationName in string]: HasOneAssociation<WildebeestModelName>;
  };
  /** The has many associations (adds `thisId` to the association model) */
  hasMany?: {
    [associationName in string]: HasManyAssociation<WildebeestModelName>;
  };
  /** Indicates there exists a join table with the association */
  belongsToMany?: {
    [associationName in string]: BelongsToManyAssociation<WildebeestModelName>;
  }; // TODO [string in TModelName]
};

/**
 * The associations for a converted into standard sequelize options
 */
export type ConfiguredAssociations = {
  /** The belongs to associations (adds `associationId` to the model) */
  belongsTo: {
    [associationName in string]: sequelize.BelongsToOptions &
      Required<AssociationModelName<WildebeestModelName>>;
  };
  /** The has one associations (adds `thisId` to the association model) */
  hasOne: {
    [associationName in string]: sequelize.HasOneOptions &
      Required<AssociationModelName<WildebeestModelName>>;
  };
  /** The has many associations (adds `thisId` to the association model) */
  hasMany: {
    [associationName in string]: sequelize.HasManyOptions &
      Required<AssociationModelName<WildebeestModelName>>;
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
  TModel extends sequelize.Model = sequelize.Model
> = {
  /** The name of the table */
  tableName?: string;
  /** The sequelize db model attribute definitions */
  attributes?: Attributes;
  /** The default attributes to add to every model (ID, createdAt, updatedAt), set this to remove these columns */
  defaultAttributes?: Attributes;
  /** The associations for that db model */
  associations?: Associations;
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
  TModel extends sequelize.Model = sequelize.Model
> = Required<
  Omit<
    ModelDefinition<TModel>,
    'dontMatchBelongTo' | 'associations' | 'attributes' | 'defaultAttributes'
  >
> & {
  /** The configured model attributes */
  attributes: ConfiguredAttributes;
  /** The configured sequelize association options */
  associations: ConfiguredAssociations;
  /** Save the initial associations */
  rawAssociations: Required<Associations>;
  /** Save the initial attributes */
  rawAttributes: Attributes;
};

/**
 * Model map definition from model name to model definition
 */
export type AnyModelMap = {
  [modelName in string]: typeof WildebeestModel;
};

/**
 * A mapping from database model name to
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModelMap extends AnyModelMap {}

/**
 * The names of database models
 */
export type WildebeestModelName = StringKeys<ModelMap>;

/**
 * This is the name of a db model but since migrations may change the name of the model,
 * easiest thing we can do is make a string.
 *
 * It is still useful to know that the paramter is a db model name so we specify explicitly
 */
export type WildebeestStringModelName = string;

/**
 * A UUID for a db model.
 *
 * Uses nominal typing to enforce that an ID of one model will never be assigned to the id of another model.
 */
export type ID<TModelName extends WildebeestModelName> = string & {
  /** The name of the db model */
  modelName: TModelName;
};

/**
 * Map containing db model
 */
export type InstanceMap = {
  [k in keyof ModelMap]: InstanceType<ModelMap[k]>;
};

/**
 * Map from database model name to input attributes for that model
 */
export type ModelInputMap = {
  [k in keyof ModelMap]: ExtractAttributes<
    // ModelMap[k]['definition']['attributes']
    any
  >;
};

/**
 * A database model instance that is defined. Basically `Model` but enforced to be one of the specific models aka `ApiKey`, `User`, `Organization`, `Amplitude`...
 */
export type ModelInstance = InstanceMap[keyof InstanceMap] & {
  /** Always a valid database model */
  modelName: WildebeestModelName;
};

/**
 * Map containing db model
 */
export type InstanceMapInverse<TModel extends ModelInstance> = keyof SubType<
  InstanceMap,
  TModel
>;

/**
 * Type generic that looks up the db model instance type by mode name
 */
export type ModelByName<TModelName extends WildebeestModelName> = InstanceType<
  ModelMap[TModelName]
>;

/**
 * Type generic that looks up the db model instance type by mode name
 */
export type ModelConstructorByModel<
  TModel extends ModelInstance
> = ModelMap[InstanceMapInverse<TModel>];

/**
 * Generic type that converts a database model to its constructor
 */
export type ModelToConstructor<
  TModel extends ModelInstance
> = ModelMap[TModel['modelName']];

// ///// //
// Umzug //
// ///// //

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
export type QueryHelpers<TAttributes extends Attributes> = {
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
    getRowDefaults: RowUpdater<TAttributes>,
    columnDefinitions: TAttributes,
    options: UpdateRowOptions,
    batchProcessOptions?: WhereOptions,
  ) => Promise<number>;
};

/**
 * Options for running a query with a transaction
 */
export type TransactionOptions = {
  /** The database transaction */
  transaction?: sequelize.Transaction;
};

/**
 * Transaction options when running a migration come with helper functions
 */
export type MigrationTransactionOptions<
  TAttributes extends Attributes = Attributes
> = {
  /** Helper functions that run within the migration transaction */
  queryT: QueryHelpers<TAttributes>;
} & TransactionOptions;

// ///// //
// Hooks //
// ///// //

/**
 * Db model hooks
 */
export type HookOptions<M extends WildebeestModel> = Partial<
  Spread<
    ModelHooks<M>,
    {
      /** Before validate, missing transaction */
      beforeValidate(
        attributes: M,
        options: ValidationOptions & Partial<TransactionOptions>,
      ): HookReturn;
      /** After validate, missing transaction */
      afterValidate(
        attributes: M,
        options: ValidationOptions & Partial<TransactionOptions>,
      ): HookReturn;
      /** Before row is created */
      beforeCreate(
        attributes: M,
        options: MergedHookOptions<M, 'create'>,
      ): HookReturn;
      /** After row is created */
      afterCreate(
        attributes: M,
        options: MergedHookOptions<M, 'create'>,
      ): HookReturn;
      /** Before row is destroyed */
      beforeDestroy(
        instance: M,
        options: MergedHookOptions<M, 'destroy'>,
      ): HookReturn;
      /** After row is destroyed */
      afterDestroy(
        instance: M,
        options: MergedHookOptions<M, 'destroy'>,
      ): HookReturn;
      /** Before row is updated */
      beforeUpdate(
        instance: M,
        options: MergedHookOptions<M, 'update'>,
      ): HookReturn;
      /** After row is updated */
      afterUpdate(
        instance: M,
        options: MergedHookOptions<M, 'update'>,
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
  destroy: sequelize.InstanceDestroyOptions;
};

/**
 * Helper type to ensure model extends these options
 */
export type HookOptionsExtender = {
  /** Must implement options */
  hookOptionsT: HookExtraOptions;
};

/**
 * Construct the hook options by combining existing with custom
 *
 * TODO potentially explore making these a required arg, also explore why this causes memory issues
 */
export type MergedHookOptions<
  TModel extends HookOptionsExtender,
  THook extends keyof HookExtraOptions
> = TModel['hookOptionsT'][THook] extends {}
  ? TModel['hookOptionsT'][THook] & HookDefaultOptions[THook]
  : HookDefaultOptions[THook];

// /////// //
// Express //
// /////// //

/**
 * Wildebeest is mounted onto res.locals
 */
export type WildebeestResponse = Omit<express.Response, 'locals'> & {
  /** Local values accessible in controller functions */
  locals: {
    /** The wildebeest migrator */
    wildebeest: Wildebeest;
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

/**
 * Identifiers for which model instances need to be joined
 */
export type SyncAssociationsIdentifiers<
  TPrimaryModelName extends WildebeestModelName,
  TAssociationModelName extends WildebeestModelName
> = {
  /** The id of the `primaryModel` that being updated */
  primaryModelId: ID<TPrimaryModelName>;
  /** The ids that of the `secondaryModel` that should have a join with the instance in the `primaryModel`. A promise can be provided to dynamically determine these ids. */
  associationIds: ID<TAssociationModelName>[];
  /** The extra where options when validating `associationIds` (oftentimes { organizationId: 'my-org-uuid' }) */
  secondaryFindWhere: WhereOptions;
  /** The instance of the primary model can be provided if already in memory */
  primaryInstance?: ModelByName<TPrimaryModelName>;
};
