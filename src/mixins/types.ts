/**
 * Type definitions used to define the type for dynamically injected sequelize prototypes
 *
 * TODO options undefined handling
 */

// external modules
import {
  BelongsToCreateAssociationMixinOptions,
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin as SequelizeBelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin as SequelizeBelongsToManyAddAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixinOptions,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin as SequelizeBelongsToManyHasAssociationMixin,
  BelongsToManyRemoveAssociationMixin as SequelizeBelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin as SequelizeBelongsToManyRemoveAssociationsMixin,
  BelongsToManySetAssociationsMixin as SequelizeBelongsToManySetAssociationsMixin,
  BelongsToSetAssociationMixin as SequelizeBelongsToSetAssociationMixin,
  FindOptions,
  HasManyAddAssociationMixin as SequelizeHasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixinOptions,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin as SequelizeHasManyHasAssociationMixin,
  HasOneCreateAssociationMixinOptions,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin as SequelizeHasOneSetAssociationMixin,
} from 'sequelize/types';

// global
import {
  AttributeInputs,
  MergedHookOptions,
  ModelMap,
} from '@wildebeest/types';

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
  BelongsToManyGetAssociationsMixin,
};

/**
 * BelongsToManyCreateAssociationMixin
 */
export type BelongsToManyCreateAssociationMixin<TModel extends AnyModel> = (
  values: AttributeInputs,
  options?: MergedHookOptions<TModel, 'create'> &
    BelongsToManyCreateAssociationMixinOptions,
) => Promise<TModel>;

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
> = SequelizeBelongsToManyRemoveAssociationMixin<TModel, TModelPrimaryKey>;

/**
 * BelongsToManyRemoveAssociationsMixin with primary key set by default
 */
export type BelongsToManyRemoveAssociationsMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeBelongsToManyRemoveAssociationsMixin<TModel, TModelPrimaryKey>;

// ///////// //
// belongsTo //
// ///////// //

export { BelongsToGetAssociationMixin };

/**
 * BelongsToCreateAssociationMixin
 */
export type BelongsToCreateAssociationMixin<TModel extends AnyModel> = (
  values: AttributeInputs,
  options?: MergedHookOptions<TModel, 'create'> &
    BelongsToCreateAssociationMixinOptions,
) => Promise<TModel>;

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
  options?: MergedHookOptions<TModel, 'create'> &
    MergedHookOptions<TModel, 'update'>,
) => Promise<TModel>;

// ////// //
// hasOne //
// ////// //

export { HasOneGetAssociationMixin };

/**
 * HasOneCreateAssociationMixin
 */
export type HasOneCreateAssociationMixin<TModel extends AnyModel> = (
  values: AttributeInputs,
  options?: MergedHookOptions<TModel, 'create'> &
    HasOneCreateAssociationMixinOptions,
) => Promise<TModel>;

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
  options?: MergedHookOptions<TModel, 'create'> &
    MergedHookOptions<TModel, 'update'>,
) => Promise<TModel>;

// /////// //
// hasMany //
// /////// //

export { HasManyCountAssociationsMixin, HasManyGetAssociationsMixin };

/**
 * HasManyCreateAssociationMixin with primary key set by default
 */
export type HasManyCreateAssociationMixin<TModel extends AnyModel> = (
  values: AttributeInputs,
  options?: MergedHookOptions<TModel, 'create'> &
    HasManyCreateAssociationMixinOptions,
) => Promise<TModel>;

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
  allOptions?: MergedHookOptions<TModel, 'create'>,
) => Promise<TModel[]>;

/**
 * Destroy all child instances with individual hooks
 */
export type HasManyDestroyAllAssociationMixin<TModel extends AnyModel> = (
  options?: MergedHookOptions<TModel, 'destroy'>,
) => Promise<void>;

/**
 * Find a single item and destroy it, if the item does not exist throw and error
 */
export type HasManyDestroyOneAssociationMixin<TModel extends AnyModel> = (
  findOptions: FindOptions,
  options?: MergedHookOptions<TModel, 'destroy'>,
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
  options?: MergedHookOptions<TModel, 'update'>,
) => Promise<TModel>;

/**
 * Find a single child instance and update it, throw an error when not found
 */
export type HasManyUpdateOneAssociationMixin<TModel extends AnyModel> = (
  findOptions: FindOptions,
  input: AttributeInputs,
  options?: MergedHookOptions<TModel, 'update'>,
) => Promise<TModel>;

/**
 * Lookup a child and update it, or create a new instance when not found
 */
export type HasManyUpdateOrCreateAssociationMixin<TModel extends AnyModel> = (
  findOptions: FindOptions,
  input: AttributeInputs,
  options?: MergedHookOptions<TModel, 'create'> &
    MergedHookOptions<TModel, 'update'>,
) => Promise<TModel>;
