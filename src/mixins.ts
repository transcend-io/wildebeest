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
import {
  Associations,
  Identity,
  Merge,
  ModelMap,
  ObjByString,
  StringKeys,
} from './types';

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
 * These are the mixin options that can be set for each type of association
 */
export type GetValuesType<
  TAssociation extends AnyModel,
  TAssociationId = TAssociation['id']
> = {
  /** Mixins for a belongsTo association */
  belongsTo: {
    [k in string]:
      | TAssociation // TODO ENFORCE TASSOCIATION AT THIS LEVEL
      | BelongsToGetAssociationMixin<TAssociation>
      | BelongsToSetAssociationMixin<TAssociation, TAssociationId>
      | BelongsToCreateAssociationMixin<TAssociation>;
  };
  /** Mixins for a hasMany association */
  hasMany: {
    [k in string]:
      | readonly TAssociation[]
      | HasManyGetAssociationsMixin<TAssociation>
      | HasManyAddAssociationMixin<TAssociation, TAssociationId>
      | HasManyHasAssociationMixin<TAssociation, TAssociationId>
      | HasManyCountAssociationsMixin
      | HasManyCreateAssociationMixin<TAssociation>;
  };
  /** Mixins for a hasOne association */
  hasOne: {
    [k in string]:
      | TAssociation
      | HasOneGetAssociationMixin<TAssociation>
      | HasOneSetAssociationMixin<TAssociation, TAssociationId>
      | HasOneCreateAssociationMixin<TAssociation>;
  };
  /** Mixins for a belongsToMany association */
  belongsToMany: {
    [k in string]:
      | readonly TAssociation[]
      | BelongsToManyGetAssociationsMixin<TAssociation>
      | BelongsToManyAddAssociationMixin<TAssociation, TAssociationId>
      | BelongsToManyHasAssociationMixin<TAssociation, TAssociationId>
      | BelongsToManyCountAssociationsMixin
      | BelongsToManyCreateAssociationMixin<TAssociation>;
  };
};

/**
 * Define the mixins added by the associations
 */
export type Mixins<
  TAssociations extends Associations,
  TModel extends AnyModel = AnyModel,
  TAssociationId = TModel['id']
> = {
  // TODO ideally keyof TAssociations
  [associationType in keyof Associations]?: TAssociations[associationType] extends (
    | {}
    | string)
    ? {
        [k in StringKeys<TAssociations[associationType]>]: GetValuesType<
          TModel,
          TAssociationId
        >[associationType];
      }
    : { [k in string]: undefined }; // should not be defined
};

/**
 * The default mixin definitions
 */
export type DefaultMixins = Mixins<Associations, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * A generic type that will enforce a valid mixin definition
 */
export type DefineMixins<
  TAssociations extends Associations,
  TMixins extends Mixins<TAssociations, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
> = TMixins;

/**
 * Collapse the key - values of the mixin definitions down from 3 levels to a single object { [k in string]: Function }
 */
export type CollapseMixins<TMixins extends Mixins<Associations>> = Identity<
  Merge<TMixins extends ObjByString ? Merge<TMixins> : never>
>;
