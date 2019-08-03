// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ModelMap, StringKeys, SyncError } from '@wildebeest/types';
import getAssociationsByModelName from '@wildebeest/utils/getAssociationsByModelName';

/**
 * For `hasOne` and `hasMany` relations, check that they have an opposing `belongsTo` association configured.
 *
 * @param wildebeest - The wildebeest config
 * @param modelName - The name of the model that has the `hasOne` or `hasMany` relations
 * @param associationTable - The name of the table being associated
 * @returns Any errors related to mismatching belongs to configurations
 */
export default function checkMatchingBelongsTo<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  modelName: StringKeys<TModels>,
  associationTable: StringKeys<TModels>,
): SyncError[] {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Get the associations of the association
  const { associations = {} } = wildebeest.getModelDefinition(associationTable);
  const { belongsTo = {} } = associations;

  // Ensure `modelName` is found in one of the associations
  if (getAssociationsByModelName(modelName, belongsTo).length === 0) {
    errors.push({
      message: `Missing belongsTo opposite on "${associationTable}" to ${modelName}`,
      tableName: wildebeest.pluralCase(modelName),
    });
  }

  return errors;
}
