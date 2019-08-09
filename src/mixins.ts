/**
 *
 * ## Wildebeest Mixing Type Definitions
 * Type definitions used to define the type for dynamically injected sequelize prototypes
 *
 * @module wildbeest/types
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
  BelongsToSetAssociationMixin as SequelizeBelongsToSetAssociationMixin,
  HasManyAddAssociationMixin as SequelizeHasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin as SequelizeHasManyHasAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin as SequelizeHasOneSetAssociationMixin,
} from 'sequelize/types';

// db
import WildebeestModel from './classes/WildebeestModel';

// local
import { ModelMap } from './types';

export {
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
};

/**
 * Any wildebeest model
 */
export type AnyModel = WildebeestModel<ModelMap>;

/**
 * HasOneSetAssociationMixin with primary key set by default
 */
export type HasOneSetAssociationMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeHasOneSetAssociationMixin<TModel, TModelPrimaryKey>;

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
 * BelongsToSetAssociationMixin with primary key set by default
 */
export type BelongsToSetAssociationMixin<
  TModel extends AnyModel,
  TPrimaryKey = TModel['id']
> = SequelizeBelongsToSetAssociationMixin<TModel, TPrimaryKey>;

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
 * BelongsToManyAddAssociationsMixin with primary key set by default
 */
export type BelongsToManyAddAssociationsMixin<
  TModel extends AnyModel,
  TModelPrimaryKey = TModel['id']
> = SequelizeBelongsToManyAddAssociationsMixin<TModel, TModelPrimaryKey>;
