// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  BelongsToAssociation,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';

/**
 * Validate a single belongsTo association
 *
 * @param wildebeest - The wildebeest configuration
 * @param modelName - The name of the model being checked
 * @param tableName - The table of the model being checked
 * @param association - The association configuration
 * @param name - The name of the association
 * @returns True if belongs to association is valiid
 */
export default function checkBelongsToAssociation<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  modelName: StringKeys<TModels>,
  tableName: string,
  association: BelongsToAssociation<StringKeys<TModels>>,
  associationName: string,
): SyncError[] {
  // Keep track of errors
  const errors: SyncError[] = [];

  // The name of the current association
  const associationModelName =
    typeof association === 'object' && association.modelName
      ? association.modelName
      : (associationName as StringKeys<TModels>);

  // Get the associations of the association
  const {
    associations = {},
    dontMatchBelongsTo,
  } = wildebeest.getModelDefinition(associationModelName);

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
