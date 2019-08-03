// global
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import {
  ConfiguredModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';

/**
 * Check that the associations are correct for a `belongsTo` between two tables that are joining
 *
 * @param db - The wildebeest db
 * @param model - The model to check the associations for
 * @returns Any errors relaetd to the belongs to association config of a join table
 */
export default async function checkJoinBelongsTo<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  { associations, tableName }: ConfiguredModelDefinition<StringKeys<TModels>>,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Ensure db is defined
  if (!db) {
    // TODO maybe have a type that has these enforced to be set to prevent need for type check all over
    throw new Error(
      `Wildbeest instance must be initialized before checking belongsTo`,
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
    const [first, second] = Object.keys(belongsTo) as Extract<
      keyof TModels,
      string
    >[];

    // Helper to check if belongsToMany config is setup
    const hasBelongsToConfig = (
      firstModelName: StringKeys<TModels>,
      secondModelName: StringKeys<TModels>,
    ): boolean => {
      const oppositeAssociations = db.model(firstModelName).definition
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
