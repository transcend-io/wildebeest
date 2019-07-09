// global
import { logger } from '@bk/loggers';

// db
import { getAssociationAs } from '@bk/db/helpers';
import Model from '@bk/db/ModelManager';
import { Association } from '@bk/db/types';

/**
 * Check if the model associations are synced
 *
 * @memberof module:migrations/helpers
 *
 * @param model - The model to check the associations for
 * @returns True if all associations are setup as expected
 */
export default async function checkAssociationsSync(
  model: Model,
): Promise<boolean> {
  let valid = true;

  // Check if an association matches model table
  const isSame = (oppositeAssociation): boolean =>
    (oppositeAssociation.name || oppositeAssociation) === model.name;

  // First validate the belongsTo associations
  if (model.isJoin) {
    // Join tables must have belongsToMany specified by each of its belongsTo
    // Ensure that there are two belongsTo association
    const hasTwoBelongsTo = model.belongsTo.length >= 2;
    if (!hasTwoBelongsTo) {
      logger.error(
        `Join table: "${model.tableName}" expected to have at least 2 belongsTo associations`,
      );
    }
    valid = valid && hasTwoBelongsTo;

    // Ensure each belongsTo has a belongsToMany to the opposite belongsTo
    if (hasTwoBelongsTo) {
      // Joins between these models
      const [first, second] = model.belongsTo;

      // Helper to check if belongsToMany config is setup
      const hasBelongsToConfig = (otherModel, opposite): boolean =>
        model
          .lookupModel(otherModel)
          .getClass()
          .belongsToMany.includes(opposite);

      // Check if the first table is setup
      const firstValid = hasBelongsToConfig(first, second);
      if (!firstValid) {
        logger.error(`Table "${first}" missing belongsToMany "${second}"`);
      }

      // Check if the second table is setup
      const secondValid = hasBelongsToConfig(second, first);
      if (!secondValid) {
        logger.error(`Table "${second}" missing belongsToMany "${first}"`);
      }

      valid = valid && firstValid && secondValid;
    }
  } else {
    // Ensure each belongsTo has an opposite hasOne or hasMany
    model.belongsTo.forEach((association) => {
      // The name of the current association
      const associationName = getAssociationAs(association);
      const associationTable =
        typeof association === 'string' ? association : association.name;

      // Get the associations of the association
      const { hasOne, hasMany, dontMatchBelongsTo } = model
        .lookupModel(association)
        .getClass();

      // Can skip if dont need to match it
      if (dontMatchBelongsTo) {
        return;
      }

      // Check if there is a hasOne or a hasMany
      const [hasOneOpposite] = hasOne.filter(isSame);
      const [hasManyOpposite] = hasMany.filter(isSame);

      // Check if in sync
      const setCount = [hasOneOpposite, hasManyOpposite].filter((x) => x)
        .length;

      // Log errors
      const possibleOpposites = 'hasOne or hasMany';
      const identifier = `Table "${associationTable}"${
        associationName === associationTable ? '' : ` (as "${associationName}")`
      }`;
      if (setCount > 1) {
        logger.error(
          `${identifier} has multiple ${possibleOpposites} associations to "${model.name}"`,
        );
      } else if (setCount < 1) {
        logger.error(
          `${identifier} is missing a ${possibleOpposites} association to "${model.name}"`,
        );
      }
      valid = valid && setCount === 1;
    });
  }

  // Check if a belongsTo exists
  const hasMatchingBelongsTo = (association: Association): void => {
    // The name of the current association
    const associationTable =
      typeof association === 'string' ? association : association.name;

    // If the association is only used in lookup, no need to have match
    if (typeof association === 'object' && association.lookupOnly) {
      return null;
    }

    // Get the associations of the association
    const { belongsTo } = model.lookupModel(association).getClass();

    const [belongsToOpposite] = belongsTo.filter(isSame);
    if (!belongsToOpposite) {
      logger.error(
        `Missing belongsTo opposite on "${associationTable}" to ${model.name}`,
      );
    }

    valid = valid && !!belongsToOpposite;
    return null;
  };

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
      logger.error(
        `Missing belongsToMany on "${associationTable}" to ${model.name}`,
      );
    }

    valid = valid && !!belongsToManyOpposite;
  });

  // True if associations in sync
  return valid;
}
