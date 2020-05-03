// global
import type { WildebeestModel } from '@wildebeest/classes';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import {
  ConfiguredModelDefinition,
  SyncError,
  WildebeestModelName,
  WildebeestStringModelName,
} from '@wildebeest/types';
import getKeys from '@wildebeest/utils/getKeys';

/**
 * Check that the associations are correct for a `belongsTo` between two tables that are joining
 *
 * @param db - The wildebeest db
 * @param model - The model to check the associations for
 * @returns Any errors related to the belongs to association config of a join table
 */
export default async function checkJoinBelongsTo(
  db: WildebeestDb,
  { associations, tableName }: ConfiguredModelDefinition,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  const getModel = (
    modelName: WildebeestStringModelName,
  ): typeof WildebeestModel => db.model(modelName as WildebeestModelName);

  // Ensure db is defined
  if (!db) {
    // TODO maybe have a type that has these enforced to be set to prevent need for type check all over
    throw new Error(
      `wildebeest instance must be initialized before checking belongsTo`,
    );
  }

  // The belongs to associations
  const { belongsTo } = associations;

  // Join tables must have belongsToMany specified by each of its belongsTo
  // Ensure that there are two belongsTo association
  if (Object.values(belongsTo).length < 2) {
    errors.push({
      message: `Join table: "${tableName}" expected to have at least 2 belongsTo associations`,
      tableName,
    });
  } else {
    // Joins between these models
    // TODO expecting to be first two there
    const [first, second] = getKeys(belongsTo);

    // Helper to check if belongsToMany config is setup
    const hasBelongsToConfig = (
      firstModelName: WildebeestStringModelName,
      secondModelName: WildebeestStringModelName,
    ): boolean => {
      const oppositeAssociations = getModel(firstModelName).definition
        .associations;
      return (
        !!oppositeAssociations &&
        !!oppositeAssociations.belongsToMany &&
        secondModelName in oppositeAssociations.belongsToMany
      );
    };

    // Check if the first table is setup
    const firstValid = hasBelongsToConfig(first, second);
    if (!firstValid) {
      errors.push({
        message: `Table "${first}" missing belongsToMany "${second}"`,
        tableName,
      });
    }

    // Check if the second table is setup
    const secondValid = hasBelongsToConfig(second, first);
    if (!secondValid) {
      errors.push({
        message: `Table "${second}" missing belongsToMany "${first}"`,
        tableName,
      });
    }
  }
  return errors;
}
