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
  BelongsToManyAddAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToSetAssociationMixin,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
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
  BelongsToManyAddAssociationMixin,
  BelongsToManyCountAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyGetAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToSetAssociationMixin,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
};

/**
 * These are the mixin options that can be set for each type of association
 */
export type GetValuesType<
  TAssociation extends WildebeestModel<ModelMap>,
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
  TModel extends WildebeestModel<ModelMap> = WildebeestModel<ModelMap>,
  TAssociationId = TModel['id']
> = {
  // TODO ideally keyof TAssociations
  [associationType in StringKeys<
    Associations
  >]: TAssociations[associationType] extends {}
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
