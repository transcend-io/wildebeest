/**
 *
 * ## Wildebeest Mixing Type Definitions
 * Type definitions used to define the type for dynamically injected sequelize prototypes
 *
 * @module wildebeest/types
 * @see module:migrations
 */

// external modules
import {
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin as SequelizeBelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin as SequelizeBelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin as SequelizeBelongsToManyHasAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin as SequelizeBelongsToManySetAssociationsMixin,
  BelongsToSetAssociationMixin as SequelizeBelongsToSetAssociationMixin,
  CreateOptions,
  DestroyOptions,
  FindOptions,
  HasManyAddAssociationMixin as SequelizeHasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin as SequelizeHasManyHasAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin as SequelizeHasOneSetAssociationMixin,
  UpdateOptions,
} from 'sequelize/types';

// global
import { AttributeInputs, ModelMap } from '@wildebeest/types';

// classes
import WildebeestModel from '@wildebeest/classes/WildebeestModel';

/**
 * Any wildebeest model
 */
export type AnyModel = WildebeestModel<ModelMap>;

/**
 * Filter keys in object T for those with value U
 */
export type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * The type of the underlying array
 */
export type ArrType<T> = T extends (infer TObj)[] ? TObj : T;

/**
 * Enforce that the result is a model
 */
export type IsModel<TM> = TM extends AnyModel ? TM : never;

// ///////////// //
// belongsToMany //
// ///////////// //

export {
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
};

/**
 * BelongsToManyHasAssociationMixin with primary key set by default
 */
export type BelongsToManyHasAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeBelongsToManyHasAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * BelongsToManyAddAssociationMixin with primary key set by default
 */
export type BelongsToManyAddAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeBelongsToManyAddAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * BelongsToManySetAssociationsMixin with primary key set by default
 */
export type BelongsToManySetAssociationsMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeBelongsToManySetAssociationsMixin<TModel, TModelPrimaryKey>;

/**
 * BelongsToManyAddAssociationsMixin with primary key set by default
 */
export type BelongsToManyAddAssociationsMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeBelongsToManyAddAssociationsMixin<TModel, TModelPrimaryKey>;

/**
 * BelongsToManyRemoveAssociationMixin with primary key set by default
 */
export type BelongsToManyRemoveAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = BelongsToManyRemoveAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * BelongsToManyRemoveAssociationsMixin with primary key set by default
 */
export type BelongsToManyRemoveAssociationsMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = BelongsToManyRemoveAssociationsMixin<TModel, TModelPrimaryKey>;

// ///////// //
// belongsTo //
// ///////// //

export { BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin };

/**
 * BelongsToSetAssociationMixin with primary key set by default
 */
export type BelongsToSetAssociationMixin<
  TModel extends AnyModel,
  TPrimaryKey = TModel['id']
> = SequelizeBelongsToSetAssociationMixin<TModel, TPrimaryKey>;

/**
 * Lookup the relationship and return the cached value if already looked up
 */
export type BelongsToGetCachedAssociationMixin<TModel extends AnyModel> = (
  findOptions?: FindOptions,
) => Promise<TModel>;

/**
 * Lookup the relationship and return the cached value if already looked up
 */
export type BelongsToGetOrDefaultAssociationMixin<TModel extends AnyModel> = (
  defaultInput?: AttributeInputs,
) => Promise<TModel>;

/**
 * Lookup a child and update it, or create a new instance when not found
 */
export type BelongsToUpdateOrCreateAssociationMixin<TModel extends AnyModel> = (
  input: AttributeInputs,
  options?: UpdateOptions,
) => Promise<TModel>;

// ////// //
// hasOne //
// ////// //

export { HasOneCreateAssociationMixin, HasOneGetAssociationMixin };

/**
 * HasOneSetAssociationMixin with primary key set by default
 */
export type HasOneSetAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeHasOneSetAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * Lookup the relationship and return the cached value if already looked up
 */
export type HasOneGetCachedAssociationMixin<TModel extends AnyModel> = (
  findOptions?: FindOptions,
) => Promise<TModel>;

/**
 * Lookup the relationship and return the cached value if already looked up
 */
export type HasOneGetOrDefaultAssociationMixin<TModel extends AnyModel> = (
  defaultInput?: AttributeInputs,
) => Promise<TModel>;

/**
 * Lookup a child and update it, or create a new instance when not found
 */
export type HasOneUpdateOrCreateAssociationMixin<TModel extends AnyModel> = (
  input: AttributeInputs,
  options?: UpdateOptions,
) => Promise<TModel>;

// /////// //
// hasMany //
// /////// //

export {
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
};

/**
 * HasManyHasAssociationMixin with primary key set by default
 */
export type HasManyHasAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeHasManyHasAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * HasManyAddAssociationMixin with primary key set by default
 */
export type HasManyAddAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeHasManyAddAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * Bulk create a handful of models
 */
export type HasManyCreateManyAssociationsMixin<TModel extends AnyModel> = (
  inputs: AttributeInputs[],
  allOptions?: CreateOptions,
) => Promise<TModel[]>;

/**
 * Destroy all child instances with individual hooks
 */
export type HasManyDestroyAllAssociationMixin = (
  options?: DestroyOptions,
) => Promise<void>;

/**
 * Find a single item and destroy it, if the item does not exist throw and error
 */
export type HasManyDestroyOneAssociationMixin = (
  findOptions: FindOptions,
  options?: DestroyOptions,
) => Promise<boolean>;

/**
 * Get the first item matching options and throws error if no matches
 */
export type HasManyGetOneAssociationMixin<TModel extends AnyModel> = (
  findOptions: FindOptions,
  errorMessage?: string,
) => Promise<TModel>;

/**
 * Update all children of a model
 */
export type HasManyUpdateAllAssociationsMixin<TModel extends AnyModel> = (
  input: AttributeInputs,
  options?: UpdateOptions,
) => Promise<TModel>;

/**
 * Find a single child instance and update it, throw an error when not found
 */
export type HasManyUpdateOneAssociationMixin<TModel extends AnyModel> = (
  findOptions: FindOptions,
  input: AttributeInputs,
  options?: UpdateOptions,
) => Promise<TModel>;

/**
 * Lookup a child and update it, or create a new instance when not found
 */
export type HasManyUpdateOrCreateAssociationMixin<TModel extends AnyModel> = (
  findOptions: FindOptions,
  input: AttributeInputs,
  options?: UpdateOptions,
) => Promise<TModel>;
