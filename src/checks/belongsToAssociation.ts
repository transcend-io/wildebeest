// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  BelongsToAssociation,
  SyncError,
  WildebeestModelName,
  WildebeestStringModelName,
} from '@wildebeest/types';

/**
 * Validate a single belongsTo association
 *
 * @param wildebeest - The wildebeest configuration
 * @param modelName - The name of the model being checked
 * @param tableName - The table of the model being checked
 * @param association - The association configuration
 * @param name - The name of the association
 * @returns True if belongs to association is valid
 */
export default function checkBelongsToAssociation(
  wildebeest: Wildebeest,
  modelName: WildebeestStringModelName,
  tableName: string,
  association: BelongsToAssociation<WildebeestModelName>,
  associationName: string,
): SyncError[] {
  // Keep track of errors
  const errors: SyncError[] = [];

  // The name of the current association
  const associationModelName =
    typeof association === 'object' && association.modelName
      ? association.modelName
      : (associationName as WildebeestStringModelName);

  // Get the associations of the association
  const {
    associations = {},
    dontMatchBelongsTo,
  } = wildebeest.getModelDefinition(
    associationModelName as WildebeestModelName,
  );

  // Can skip if dont need to match it
  if (dontMatchBelongsTo) {
    return errors;
  }

  const { hasOne = {}, hasMany = {} } = associations;

  // Check if there is a hasOne or a hasMany
  const hasOneAssociation =
    hasOne[modelName] ||
    Object.values(hasOne).find(
      (a) => typeof a === 'object' && a.modelName === modelName,
    );
  const hasManyAssociation =
    hasMany[modelName] ||
    Object.values(hasMany).find(
      (a) => typeof a === 'object' && a.modelName === modelName,
    );

  // Log errors
  const possibleOpposites = 'hasOne or hasMany';
  const identifier = `Model "${associationModelName}"${
    associationName === associationModelName ? '' : ` (as "${associationName}")`
  }`;
  if (hasOneAssociation && hasManyAssociation) {
    errors.push({
      message: `${identifier} has multiple ${possibleOpposites} associations to "${modelName}"`,
      tableName,
    });
  } else if (!hasOneAssociation && !hasManyAssociation) {
    errors.push({
      message: `${identifier} is missing a ${possibleOpposites} association to "${modelName}"`,
      tableName,
    });
  }
  return errors;
}
