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
      attribute: `public readonly ${associationName.pluralCase}?: m.I${modelName.pascalCase}[];`,
    },
    {
      attribute: `public get${associationName.pascalPluralCase}: w.BelongsToManyGetAssociationsMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public add${associationName.pascalCase}: w.BelongsToManyAddAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public add${associationName.pascalPluralCase}: w.BelongsToManyAddAssociationsMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public has${associationName.pascalCase}: w.BelongsToManyHasAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public count${associationName.pascalPluralCase}: w.BelongsToManyCountAssociationsMixin;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.BelongsToManyCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
  ],
  belongsTo: ({ modelName, associationName }) => [
    {
      attribute: `public ${associationName.plain}Id: m.I${modelName.pascalCase}['id'];`,
    },
    {
      attribute: `public readonly ${associationName.plain}?: m.I${modelName.pascalCase};`,
    },
    {
      attribute: `public get${associationName.pascalCase}: w.BelongsToGetAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public set${associationName.pascalCase}: w.BelongsToSetAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.BelongsToCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
  ],
  hasMany: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.pluralCase}?: m.I${modelName.pascalCase}[];`,
    },
    {
      attribute: `public get${associationName.pascalPluralCase}: w.HasManyGetAssociationsMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public add${associationName.pascalCase}: w.HasManyAddAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public has${associationName.pascalCase}: w.HasManyHasAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public count${associationName.pascalPluralCase}: w.HasManyCountAssociationsMixin;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.HasManyCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
  ],
  hasOne: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.plain}?: m.I${modelName.pascalCase};`,
    },
    {
      attribute: `public get${associationName.pascalCase}: w.HasOneGetAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public set${associationName.pascalCase}: w.HasOneSetAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public create${associationName.pascalCase}: w.HasOneCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
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
      attribute: `public getCached${associationName.pascalCase}: w.BelongsToGetCachedAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public get${associationName.pascalCase}OrDefault: w.BelongsToGetOrDefaultAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}: w.BelongsToUpdateOrCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
  ],
  hasMany: ({ modelName, associationName }) => [
    {
      attribute: `public createMany${associationName.pascalPluralCase}: w.HasManyCreateManyAssociationsMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public destroyAll${associationName.pascalPluralCase}: w.HasManyDestroyAllAssociationMixin;`,
    },
    {
      attribute: `public destroyOne${associationName.pascalCase}: w.HasManyDestroyOneAssociationMixin;`,
    },
    {
      attribute: `public getOne${associationName.pascalCase}: w.HasManyGetOneAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateAll${associationName.pascalPluralCase}: w.HasManyUpdateAllAssociationsMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOne${associationName.pascalCase}: w.HasManyUpdateOneAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}: w.HasManyUpdateOrCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
  ],
  hasOne: ({ modelName, associationName }) => [
    {
      attribute: `public getCached${associationName.pascalCase}: w.HasOneGetCachedAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public get${associationName.pascalCase}OrDefault: w.HasOneGetOrDefaultAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}: w.HasOneUpdateOrCreateAssociationMixin<m.I${modelName.pascalCase}>;`,
    },
  ],
};
/* eslint-enable max-len */
