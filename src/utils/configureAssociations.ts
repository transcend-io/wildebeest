// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestModel from '@wildebeest/classes/WildebeestModel';
import { CASCADE_HOOKS, NON_NULL } from '@wildebeest/constants';
import {
  AssociationModelName,
  Associations,
  ConfiguredAssociations,
  ModelMap,
  Requirize,
  StringKeys,
} from '@wildebeest/types';
import apply from '@wildebeest/utils/apply';

/**
 * Set the `as` parameter if `modelName` is provided
 *
 * @param options: The raw options
 * @param name - The name of the association
 * @returns The options with modelName
 */
export function setAs<
  TOpts extends AssociationModelName<TModelName>,
  TModelName extends string
>(
  { modelName, ...options }: TOpts,
  name: string,
  caseTransform = (x: string): string => x,
): Requirize<TOpts, 'modelName'> {
  return {
    ...options,
    modelName: modelName || (name as TModelName),
    as: modelName ? caseTransform(name) : undefined,
  };
}

/**
 * Convert any specially termed association settings into valid sequelize options
 *
 * @param wildebeest - The wildebeest configuration
 * @param associations - The raw association inputs
 * @returns The configured sequelize associations configurations
 */
export default function configureAssociations<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  {
    belongsTo = {},
    belongsToMany = {},
    hasMany = {},
    hasOne = {},
  }: Associations<StringKeys<TModels>>,
): ConfiguredAssociations<StringKeys<TModels>> {
  /** The model names in the db */
  type TModelName = StringKeys<TModels>;

  const { models } = wildebeest;

  const getModel = (
    name: Extract<keyof TModels, string>,
  ): typeof WildebeestModel => {
    const def = models[name];
    if (def) {
      return def;
    }
    wildebeest.logger.error(`ERROR: model ${name} could not be found`);
    return undefined as any;
  };

  return {
    // Replace NON_NULL and tableName
    belongsTo: apply(belongsTo, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName)
        : {
            ...NON_NULL,
            onDelete: 'CASCADE',
            modelName: associationName as TModelName,
          },
    ),
    // Through must be provided when defining a belongsToMany association
    belongsToMany: apply(belongsToMany, ({ throughModelName, ...options }) => ({
      through: getModel(throughModelName),
      ...options,
    })),
    // Replace CASCADE_HOOKS and tableName
    hasMany: apply(hasMany, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName, wildebeest.pluralCase)
        : { ...CASCADE_HOOKS, modelName: associationName as TModelName },
    ),
    // Replace CASCADE_HOOKS and tableName
    hasOne: apply(hasOne, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName)
        : { ...CASCADE_HOOKS, modelName: associationName as TModelName },
    ),
  };
}
