// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { CASCADE_HOOKS, NON_NULL } from '@wildebeest/constants';
import {
  AssociationModelName,
  Associations,
  ConfiguredAssociations,
  ModelMap,
  Requirize,
  WildebeestModelName,
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
  TModelName extends WildebeestModelName
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
 * @param modelName - The name of the model being connected
 * @param associations - The raw association inputs
 * @returns The configured sequelize associations configurations
 */
export default function configureAssociations(
  wildebeest: Wildebeest,
  {
    belongsTo = {},
    belongsToMany = {},
    hasMany = {},
    hasOne = {},
  }: Associations,
): ConfiguredAssociations {
  const { models } = wildebeest;

  const getModel = <TModelName extends WildebeestModelName>(
    name: TModelName,
  ): ModelMap[TModelName] => {
    const def = models[name];
    if (def) {
      return def;
    }
    throw new Error(`ERROR: model ${name} could not be found`);
  };

  return {
    // Replace NON_NULL and tableName
    belongsTo: apply(belongsTo, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName)
        : {
            ...NON_NULL,
            onDelete: 'CASCADE',
            modelName: associationName as WildebeestModelName,
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
        : {
            ...CASCADE_HOOKS,
            modelName: associationName as WildebeestModelName,
          },
    ),
    // Replace CASCADE_HOOKS and tableName
    hasOne: apply(hasOne, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName)
        : {
            ...CASCADE_HOOKS,
            modelName: associationName as WildebeestModelName,
          },
    ),
  };
}
