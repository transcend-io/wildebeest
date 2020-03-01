// local
import { AssociationMixins } from './types';

/* eslint-disable max-len */
/**
 * The default mixins definitions added by sequelize
 */
export const SEQUELIZE_MIXINS: AssociationMixins = {
  belongsToMany: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.pluralCase}?: M.I${modelName.pascalCase}[];`,
    },
    {
      attribute: `public get${associationName.pascalPluralCase}!: w.BelongsToManyGetAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public set${associationName.pascalPluralCase}!: w.BelongsToManySetAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public add${associationName.pascalCase}!: w.BelongsToManyAddAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public add${associationName.pascalPluralCase}!: w.BelongsToManyAddAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public remove${associationName.pascalCase}!: w.BelongsToManyRemoveAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public remove${associationName.pascalPluralCase}!: w.BelongsToManyRemoveAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public has${associationName.pascalCase}!: w.BelongsToManyHasAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public count${associationName.pascalPluralCase}!: w.BelongsToManyCountAssociationsMixin;`,
    },
    {
      attribute: `public create${associationName.pascalCase}!: w.BelongsToManyCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
  belongsTo: ({ modelName, associationName, primaryKeyName }) => [
    {
      attribute: `public ${primaryKeyName}: M.I${modelName.pascalCase}['${
        primaryKeyName === `${associationName.plain}Id` ? 'id' : primaryKeyName
      }'];`,
    },
    {
      attribute: `public readonly ${associationName.plain}?: M.I${modelName.pascalCase};`,
    },
    {
      attribute: `public get${associationName.pascalCase}!: w.BelongsToGetAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public set${associationName.pascalCase}!: w.BelongsToSetAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public create${associationName.pascalCase}!: w.BelongsToCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
  hasMany: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.pluralCase}?: M.I${modelName.pascalCase}[];`,
    },
    {
      attribute: `public get${associationName.pascalPluralCase}!: w.HasManyGetAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public add${associationName.pascalCase}!: w.HasManyAddAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public has${associationName.pascalCase}!: w.HasManyHasAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public count${associationName.pascalPluralCase}!: w.HasManyCountAssociationsMixin;`,
    },
    {
      attribute: `public create${associationName.pascalCase}!: w.HasManyCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
  hasOne: ({ modelName, associationName }) => [
    {
      attribute: `public readonly ${associationName.plain}?: M.I${modelName.pascalCase};`,
    },
    {
      attribute: `public get${associationName.pascalCase}!: w.HasOneGetAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public set${associationName.pascalCase}!: w.HasOneSetAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public create${associationName.pascalCase}!: w.HasOneCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
};

/**
 * Additional mixins added by wildebeest
 */
export const WILDEBEEST_MIXINS: AssociationMixins = {
  belongsToMany: ({ throughModelName }) => [
    {
      attribute: `public ${throughModelName}?: M.I${throughModelName};`,
    },
  ],
  belongsTo: ({ modelName, associationName }) => [
    {
      attribute: `public getCached${associationName.pascalCase}!: w.BelongsToGetCachedAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public get${associationName.pascalCase}OrDefault!: w.BelongsToGetOrDefaultAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}!: w.BelongsToUpdateOrCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
  hasMany: ({ modelName, associationName }) => [
    {
      attribute: `public createMany${associationName.pascalPluralCase}!: w.HasManyCreateManyAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public destroyAll${associationName.pascalPluralCase}!: w.HasManyDestroyAllAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public destroyOne${associationName.pascalCase}!: w.HasManyDestroyOneAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public getOne${associationName.pascalCase}!: w.HasManyGetOneAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateAll${associationName.pascalPluralCase}!: w.HasManyUpdateAllAssociationsMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOne${associationName.pascalCase}!: w.HasManyUpdateOneAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}!: w.HasManyUpdateOrCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
  hasOne: ({ modelName, associationName }) => [
    {
      attribute: `public getCached${associationName.pascalCase}!: w.HasOneGetCachedAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public get${associationName.pascalCase}OrDefault!: w.HasOneGetOrDefaultAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
    {
      attribute: `public updateOrCreate${associationName.pascalCase}!: w.HasOneUpdateOrCreateAssociationMixin<M.I${modelName.pascalCase}>;`,
    },
  ],
};
/* eslint-enable max-len */
