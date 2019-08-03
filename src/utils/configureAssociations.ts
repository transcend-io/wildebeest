// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
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
import pascalCase from '@wildebeest/utils/pascalCase';

/**
 * Determine the name of the through model by check for a model definition
 *
 * @param wildebeest - The wildebeest config
 * @param modelName1 - The name of one belongsTo
 * @param modelName2 - The name of the second belongsTo
 */
function determineThroughModelName<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  modelName1: string,
  modelName2: string,
): StringKeys<TModels> {
  const createName = (m1: string, m2: string): string =>
    `${pascalCase(m1)}${wildebeest.pascalPluralCase(m2)}`;

  // Determine what the name  of the join table is
  const joinNameOne = createName(modelName1, modelName2);
  const joinNameTwo = createName(modelName2, modelName1);

  // Return whichever one exists
  if (wildebeest.db.isDefined(joinNameOne)) {
    return joinNameOne as StringKeys<TModels>;
  }
  if (wildebeest.db.isDefined(joinNameTwo)) {
    return joinNameTwo as StringKeys<TModels>;
  }

  // Throw an error if neither is defined
  throw new Error(`Neither model is defined: "${modelName1}" "${modelName2}"`);
}

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
): Requirize<TOpts, 'modelName'> {
  return {
    ...options,
    modelName: modelName || (name as TModelName),
    as: modelName ? name : undefined,
  };
}

/**
 * Convert any specially termed association settings into valid sequelize options
 *
 * @param wildebeest - The wildebeest configuration
 * @param modelName - The name of the model being connected
 * @param associations - The raw association inputs
 * @returns The configured seuqlize associations configurations
 */
export default function configureAssociations<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  modelName: string,
  {
    belongsTo = {},
    belongsToMany = {},
    hasMany = {},
    hasOne = {},
  }: Associations<StringKeys<TModels>>,
): ConfiguredAssociations<StringKeys<TModels>> {
  /** The model names in the db */
  type TModelName = StringKeys<TModels>;

  const { db } = wildebeest;

  return {
    // Replace NON_NULL and tableName
    belongsTo: apply(belongsTo, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName)
        : { ...NON_NULL, modelName: associationName as TModelName },
    ),
    // Through must be provided when defining a belongsToMany association
    belongsToMany: apply(belongsToMany, (options, associationName) => ({
      through: db.model(
        determineThroughModelName(wildebeest, modelName, associationName),
      ),
      ...options,
    })),
    // Replace CASCADE_HOOKS and tableName
    hasMany: apply(hasMany, (options, associationName) =>
      typeof options === 'object'
        ? setAs(options, associationName)
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
