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
  Association,
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
      | (TAssociation | undefined) // TODO ENFORCE TASSOCIATION AT THIS LEVEL
      | BelongsToGetAssociationMixin<TAssociation>
      | BelongsToSetAssociationMixin<TAssociation, TAssociationId>
      | BelongsToCreateAssociationMixin<TAssociation>;
  };
  /** Mixins for a hasMany association */
  hasMany: {
    [k in string]:
      | (readonly TAssociation[] | undefined)
      | HasManyGetAssociationsMixin<TAssociation>
      | HasManyAddAssociationMixin<TAssociation, TAssociationId>
      | HasManyHasAssociationMixin<TAssociation, TAssociationId>
      | HasManyCountAssociationsMixin
      | HasManyCreateAssociationMixin<TAssociation>;
  };
  /** Mixins for a hasOne association */
  hasOne: {
    [k in string]:
      | (TAssociation | undefined)
      | HasOneGetAssociationMixin<TAssociation>
      | HasOneSetAssociationMixin<TAssociation, TAssociationId>
      | HasOneCreateAssociationMixin<TAssociation>;
  };
  /** Mixins for a belongsToMany association */
  belongsToMany: {
    [k in string]:
      | (readonly TAssociation[] | undefined)
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
  [associationType in keyof TAssociations]: {
    [k in StringKeys<
      TAssociations[associationType]
    >]: associationType extends keyof GetValuesType<TModel, TAssociationId>
      ? GetValuesType<TModel, TAssociationId>[associationType]
      : never;
  };
};

/**
 * The default mixin definitions
 */
export type DefaultMixins = Mixins<Associations, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Safely merge
 */
export type MergeSafe<TMixins> = TMixins extends ObjByString
  ? Merge<TMixins>
  : never;

/**
 * Collapse the key - values of the mixin definitions down from 3 levels to a single object { [k in string]: Function }
 */
export type DefineMixins<
  TAssociations extends Associations,
  TMixins extends Mixins<TAssociations, any, any> // eslint-disable-line @typescript-eslint/no-explicit-any
> = Identity<MergeSafe<MergeSafe<TMixins>>>;

/**
 * Filter keys in object T for those with value U
 */
export type FilteredKeys<T, U> = {
  [P in keyof T]: T[P] extends U ? P : never;
}[keyof T];

/**
 * The type of the underlying array
 */
type ArrType<T> = T extends (infer TObj)[] ? TObj : T;

/**
 * Enforce that the result is a model
 */
export type IsModel<TM> = TM extends AnyModel ? TM : never;

/**
 * Extract the association definition from the set of mixins
 */
export type ExtractAssociations<
  TModel extends AnyModel,
  TMixins extends {}
> = Required<
  {
    [k in FilteredKeys<Required<TMixins>, AnyModel | AnyModel[]>]: Association<
      TModel,
      IsModel<ArrType<Required<TMixins>[k]>>
    >;
  }
>;

/**
 * Merge mixins
 */
export type MergeMixins<
  TClassBase extends new (...args: any) => any,
  TClass extends TClassBase,
  TMixins extends {}
> = Omit<TClass, 'new'> & {
  /** Indicator that model was merged */
  __isMergedMixin: true;
  /** Modify the constructor to return the mixins in the instace */
  new (...args: ConstructorParameters<TClass>): InstanceType<TClass> & TMixins;
};

/**
 * Apply mixins to a class definitions so they can be defined separately
 */
export type ImplicitMixin<
  TClassBase extends new (...args: any) => any,
  TMixins extends {}
> = <TClass extends TClassBase>(
  c: TClass,
) => MergeMixins<TClassBase, TClass, TMixins>;

/**
 * A generic class constructor
 */
export type Constructor<T = {}> = new (...args: any[]) => T;
