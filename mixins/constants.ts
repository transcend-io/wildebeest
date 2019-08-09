/**
 *
 * ## Mixins Constants
 * Constants for generating mixins
 *
 * @module mixins/constants
 * @see module:mixins
 */

// local
import { AssociationMixins } from './types';

/* eslint-disable max-len */
/**
 * The default mixins definitions added by sequelize
 */
export const SEQUELIZE_MIXINS: AssociationMixins = {
  belongsToMany: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.pluralCase}?: M["${modelName.plain}"][];`,
    },
    {
      attribute: `public get${associationName.pascalPluralCase}: w.BelongsToManyGetAssociationsMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public add${associationName.pascalCase}: w.BelongsToManyAddAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public add${associationName.pascalPluralCase}: w.BelongsToManyAddAssociationsMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public has${associationName.pascalCase}: w.BelongsToManyHasAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public count${associationName.pascalPluralCase}: w.BelongsToManyCountAssociationsMixin;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.BelongsToManyCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
  belongsTo: ({ modelName, associationName }) => [
    {
      attribute: `public ${associationName.plain}Id: M["${modelName.plain}"]['id'];`,
    },
    {
      attribute: `public readonly ${associationName.plain}?: M["${modelName.plain}"];`,
    },
    {
      attribute: `public get${associationName.pascalCase}: w.BelongsToGetAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public set${associationName.pascalCase}: w.BelongsToSetAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.BelongsToCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
  hasMany: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.pluralCase}?: M["${modelName.plain}"][];`,
    },
    {
      attribute: `public get${associationName.pascalPluralCase}: w.HasManyGetAssociationsMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public add${associationName.pascalCase}: w.HasManyAddAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public has${associationName.pascalCase}: w.HasManyHasAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public count${associationName.pascalPluralCase}: w.HasManyCountAssociationsMixin;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.HasManyCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
  hasOne: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.plain}?: M["${modelName.plain}"];`,
    },
    {
      attribute: `public get${associationName.pascalCase}: w.HasOneGetAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public set${associationName.pascalCase}: w.HasOneSetAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.HasOneCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
};

/**
 * Additional mixins added by wildebeest
 */
export const WILDEBEEST_MIXINS: AssociationMixins = {
  belongsToMany: () => [],
  belongsTo: ({ modelName, associationName }) => [
    {
      attribute: `public getCached${associationName.pascalCase}: w.BelongsToGetCachedAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public get${associationName.pascalCase}OrDefault: w.BelongsToGetOrDefaultAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}: w.BelongsToUpdateOrCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
  hasMany: ({ modelName, associationName }) => [
    {
      attribute: `public createMany${associationName.pascalPluralCase}: w.HasManyCreateManyAssociationsMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public destroyAll${associationName.pascalPluralCase}: w.HasManyDestroyAllAssociationMixin;`,
    },
    {
      attribute: `public destroyOne${associationName.pascalCase}: w.HasManyDestroyOneAssociationMixin;`,
    },
    {
      attribute: `public getOne${associationName.pascalCase}: w.HasManyGetOneAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public updateAll${associationName.pascalPluralCase}: w.HasManyUpdateAllAssociationsMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public updateOne${associationName.pascalCase}: w.HasManyUpdateOneAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}: w.HasManyUpdateOrCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
  hasOne: ({ modelName, associationName }) => [
    {
      attribute: `public getCached${associationName.pascalCase}: w.HasOneGetCachedAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public get${associationName.pascalCase}OrDefault: w.HasOneGetOrDefaultAssociationMixin<M["${modelName.plain}"]>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}: w.HasOneUpdateOrCreateAssociationMixin<M["${modelName.plain}"]>;`,
    },
  ],
};
/* eslint-enable max-len */
