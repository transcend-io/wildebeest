// global
import { Association, ModelDefinition } from '@wildebeest/types';
import getAssociationAs from '@wildebeest/utils/getAssociationAs';
import Wildebeest from '@wildebeest/Wildebeest';

// TODO break apart

/**
 * Check that the associations are correct for a join model between two tables
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The model to check the associations for
 * @returns True of the associations are configured properly for a join table
 */
export async function checkJoinModelBelongsTo(
  wildebeest: Wildebeest,
  { associations, tableName }: ModelDefinition,
): Promise<boolean> {
  let valid = true;

  // The belongs to associations
  const belongsTo = associations.belongsTo || {};

  // Join tables must have belongsToMany specified by each of its belongsTo
  // Ensure that there are two belongsTo association
  const hasTwoBelongsTo = Object.values(belongsTo).length >= 2;
  if (!hasTwoBelongsTo) {
    wildebeest.logger.error(
      `Join table: "${tableName}" expected to have at least 2 belongsTo associations`,
    );
  }
  valid = valid && hasTwoBelongsTo;

  // Ensure each belongsTo has a belongsToMany to the opposite belongsTo
  if (hasTwoBelongsTo) {
    // Joins between these models
    // TODO expecting to be first two there
    const [first, second] = Object.entries(belongsTo);

    // Helper to check if belongsToMany config is setup
    const hasBelongsToConfig = (otherModel, opposite): boolean =>
      model
        .lookupModel(otherModel)
        .getClass()
        .belongsToMany.includes(opposite);

    // Check if the first table is setup
    const firstValid = hasBelongsToConfig(first, second);
    if (!firstValid) {
      wildebeest.logger.error(
        `Table "${first}" missing belongsToMany "${second}"`,
      );
    }

    // Check if the second table is setup
    const secondValid = hasBelongsToConfig(second, first);
    if (!secondValid) {
      wildebeest.logger.error(
        `Table "${second}" missing belongsToMany "${first}"`,
      );
    }

    valid = valid && firstValid && secondValid;
  }
  return valid;
}

// Check if an association matches model table
const isSame = (oppositeAssociation): boolean =>
  (oppositeAssociation.name || oppositeAssociation) === model.name;

/**
 * Validate a single belongsTo association
 *
 * @param wildebeest - The wildebeest configuration
 * @param association - The association configuration
 * @param name - The name of the association
 * @returns True if belongs to association is valiid
 */
export function BelongsToAssociation(
  wildebeest: Wildebeest,
  association: Association,
  associationTable: string,
): boolean {
  // The name of the current association
  const associationName = getAssociationAs(association, associationTable);

  // Get the associations of the association
  const { hasOne, hasMany, dontMatchBelongsTo } = model
    .lookupModel(association)
    .getClass();

  // Can skip if dont need to match it
  if (dontMatchBelongsTo) {
    return true;
  }

  // Check if there is a hasOne or a hasMany
  const [hasOneOpposite] = hasOne.filter(isSame);
  const [hasManyOpposite] = hasMany.filter(isSame);

  // Check if in sync
  const setCount = [hasOneOpposite, hasManyOpposite].filter((x) => x).length;

  // Log errors
  const possibleOpposites = 'hasOne or hasMany';
  const identifier = `Table "${associationTable}"${
    associationName === associationTable ? '' : ` (as "${associationName}")`
  }`;
  if (setCount > 1) {
    wildebeest.logger.error(
      `${identifier} has multiple ${possibleOpposites} associations to "${model.name}"`,
    );
  } else if (setCount < 1) {
    wildebeest.logger.error(
      `${identifier} is missing a ${possibleOpposites} association to "${model.name}"`,
    );
  }
  return setCount === 1;
}

/**
 * Check if a belongsTo exists
 *
 * @param association - The association definition
 * @param associationTable - The name of the table being associated
 */
export function hasMatchingBelongsTo(
  association: Association,
  associationTable: string,
  getModelDefinition: (modelName: string) => ModelDefinition,
): boolean {
  // If the association is only used in lookup, no need to have match
  if (typeof association === 'object' && association.lookupOnly) {
    return true;
  }

  // Get the associations of the association
  const {
    associations: { belongsTo = {} },
  } = getModelDefinition(associationTable);

  const [belongsToOpposite] = belongsTo.filter(isSame);
  if (!belongsToOpposite) {
    wildebeest.logger.error(
      `Missing belongsTo opposite on "${associationTable}" to ${model.name}`,
    );
  }

  valid = valid && !!belongsToOpposite;
  return null;
}

/**
 * Check if the model associations are synced
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The model to check the associations for
 * @param getModelDefinition - A function that will lookup another model by name
 * @returns True if all associations are setup as expected
 */
export default async function AssociationsSync(
  wildebeest: Wildebeest,
  model: ModelDefinition,
): Promise<boolean> {
  const {
    associations: {
      belongsTo = {},
      belongsToMany = {},
      hasMany = {},
      hasOne = {},
    },
  } = model;
  let valid = true;

  // First validate the belongsTo associations
  if (model.isJoin) {
    const joinIsValid = await checkJoinModelBelongsTo(wildebeest, model);
    valid = valid && joinIsValid;
  } else {
    // Ensure each belongsTo has an opposite hasOne or hasMany
    const validBelongsTo = Object.keys(belongsTo).map((tableName) =>
      checkBelongsToAssociation(wildebeest, belongsTo[tableName], tableName),
    );
    valid = valid && validBelongsTo.filter((isValid) => !isValid).length === 0;
  }

  // Validate the hasOne associations
  model.hasOne.forEach(hasMatchingBelongsTo);

  // Validate the hasMany associations
  model.hasMany.forEach(hasMatchingBelongsTo);

  // Validate the belongsToMany associations
  model.belongsToMany.forEach((association) => {
    // The name of the current association
    const associationTable =
      typeof association === 'string' ? association : association.name;

    // Get the associations of the association
    const { belongsToMany } = model.lookupModel(association).getClass();

    const [belongsToManyOpposite] = belongsToMany.filter(isSame);
    if (!belongsToManyOpposite) {
      wildebeest.logger.error(
        `Missing belongsToMany on "${associationTable}" to ${model.name}`,
      );
    }

    valid = valid && !!belongsToManyOpposite;
  });

  // True if associations in sync
  return valid;
}
