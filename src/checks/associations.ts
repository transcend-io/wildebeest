// external modules
import flatten from 'lodash/flatten';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  ConfiguredModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';
import apply from '@wildebeest/utils/apply';
import getKeys from '@wildebeest/utils/getKeys';

// local
import checkBelongsToAssociation from './belongsToAssociation';
import checkJoinBelongsTo from './joinBelongsTo';
import checkMatchingBelongsTo from './matchingBelongsTo';

/**
 * Check if the model associations are synced
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The model to check the associations for
 * @param modelName - The name of the model
 * @returns Any errors related to the association not being in sync
 */
export default async function checkAssociationsSync<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  model: ConfiguredModelDefinition<StringKeys<TModels>>,
  modelName: StringKeys<TModels>,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];
  const addErrors = (errs: SyncError[]): void =>
    errs.forEach((err) => errors.push(err));

  const {
    associations: { belongsTo, belongsToMany, hasMany, hasOne },
    isJoin,
  } = model;

  // First validate the belongsTo associations
  if (isJoin) {
    addErrors(await checkJoinBelongsTo(wildebeest.db, model));
  } else {
    // Ensure each belongsTo has an opposite hasOne or hasMany
    addErrors(
      flatten(
        Object.keys(belongsTo).map((associationName) =>
          checkBelongsToAssociation(
            wildebeest,
            modelName,
            model.tableName,
            belongsTo[associationName],
            associationName,
          ),
        ),
      ),
    );
  }

  // Validate the hasOne associations
  apply(hasOne, (association) =>
    addErrors(
      checkMatchingBelongsTo(wildebeest, modelName, association.modelName),
    ),
  );

  // Validate the hasMany associations
  apply(hasMany, (association) =>
    addErrors(
      checkMatchingBelongsTo(wildebeest, modelName, association.modelName),
    ),
  );

  // Validate the belongsToMany associations
  getKeys(belongsToMany).forEach((assocationName) => {
    // Get the associations of the association
    const { associations = {} } = wildebeest.getModelDefinition(assocationName);
    if (!associations.belongsToMany || !associations.belongsToMany[modelName]) {
      errors.push({
        message: `Missing belongsToMany on "${assocationName}" to ${modelName}`,
        tableName: model.tableName,
      });
    }
  });

  // True if associations in sync
  return errors;
}
