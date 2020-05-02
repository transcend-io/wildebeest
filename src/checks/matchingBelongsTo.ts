// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  SyncError,
  WildebeestModelName,
  WildebeestStringModelName,
} from '@wildebeest/types';
import getAssociationsByModelName from '@wildebeest/utils/getAssociationsByModelName';

/**
 * For `hasOne` and `hasMany` relations, check that they have an opposing `belongsTo` association configured.
 *
 * @param wildebeest - The wildebeest config
 * @param modelName - The name of the model that has the `hasOne` or `hasMany` relations
 * @param associationTable - The name of the table being associated
 * @returns Any errors related to mismatching belongs to configurations
 */
export default function checkMatchingBelongsTo(
  wildebeest: Wildebeest,
  modelName: WildebeestStringModelName,
  associationTable: WildebeestStringModelName,
): SyncError[] {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Get the associations of the association
  const { associations = {} } = wildebeest.getModelDefinition(
    associationTable as WildebeestModelName,
  );
  const { belongsTo = {} } = associations;

  // Ensure `modelName` is found in one of the associations
  if (
    getAssociationsByModelName(modelName as WildebeestModelName, belongsTo)
      .length === 0
  ) {
    errors.push({
      message: `Missing belongsTo opposite on "${associationTable}" to ${modelName}`,
      tableName: wildebeest.pluralCase(modelName),
    });
  }

  return errors;
}
