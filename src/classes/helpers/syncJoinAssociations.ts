// external
import { Op, WhereOptions } from 'sequelize';

// db
import Wildebeest from '@wildebeest/classes/Wildebeest';
import { ID, ModelByName, WildebeestModelName } from '@wildebeest/types';
import { pascalCase } from '@wildebeest/utils';

/**
 * Identifiers for which model instances need to be joined
 */
export type SyncAssociationsIdentifiers<
  TPrimaryModelName extends WildebeestModelName,
  TAssociationModelName extends WildebeestModelName
> = {
  /** The id of the `primaryModel` that being updated */
  primaryModelId: ID<TPrimaryModelName>;
  /** The ids that of the `secondaryModel` that should have a join with the instance in the `primaryModel`. A promise can be provided to dynamically determine these ids. */
  associationIds: ID<TAssociationModelName>[];
  /** The extra where options when validating `associationIds` (oftentimes { organizationId: 'my-org-uuid' }) */
  secondaryFindWhere: WhereOptions;
  /** The instance of the primary model can be provided if already in memory */
  primaryInstance?: ModelByName<TPrimaryModelName>;
};

/**
 * The input for synchronizing a join table on a model instance update
 */
export type SyncModelsInput<
  TPrimaryModelName extends WildebeestModelName,
  TAssociationModelName extends WildebeestModelName
> = {
  /** The name of the model being updated */
  primaryModel: TPrimaryModelName;
  /** The name of the model being joined with */
  secondaryModel: TAssociationModelName;
  /** The name of the join model */
  joinModel?: WildebeestModelName;
};

/**
 * This is a helper function that will synchronize many-to-many associations when the instance is updated.
 * The update should provide the currently expected associations and the function will ensure that any extra existing associations will be destroyed and any missing associations will be added.
 *
 * @param wildebeest - The wildebeest to operate on
 * @param modelOptions - The models to join upon
 * @param identifiers - The identifiers for which models to sync join associations on
 * @returns The promise that will synchronize the join associations
 */
export default async function syncJoinAssociations<
  TPrimaryModelName extends WildebeestModelName,
  TAssociationModelName extends WildebeestModelName
>(
  { db, pascalPluralCase }: Wildebeest,
  {
    primaryModel,
    secondaryModel,
    joinModel,
  }: SyncModelsInput<TPrimaryModelName, TAssociationModelName>,
  identifiers: SyncAssociationsIdentifiers<
    TPrimaryModelName,
    TAssociationModelName
  >,
): Promise<void> {
  const {
    primaryModelId,
    primaryInstance,
    associationIds,
    secondaryFindWhere,
  } = identifiers;

  // Determine the association ids to merge with
  const calculatedAssociationIds = await Promise.resolve(associationIds);

  // Determine the name of the join table
  const calculatedJoinModel =
    joinModel || `${pascalCase(primaryModel)}${pascalCase(secondaryModel)}`;

  const SecondaryModel: any = db.model(secondaryModel);
  const PrimaryModel: any = db.model(primaryModel);

  const [
    expectedSecondaryModels,
    calculatedPrimaryInstance,
  ] = await Promise.all([
    // Ensure the secondary models being added are valid (often checking against organizationId)
    SecondaryModel.findAll({
      attributes: ['id', ...Object.keys(secondaryFindWhere)],
      where: { id: calculatedAssociationIds, ...secondaryFindWhere },
    }),
    // Get the primary model instance
    primaryInstance ||
      PrimaryModel.findOne({
        where: { id: primaryModelId },
        attributes: ['id'],
      }),
    // Destroy any relations not specified
    db.model(calculatedJoinModel as any).destroy({
      where: {
        [`${primaryModel}Id`]: primaryModelId,
        [`${secondaryModel}Id`]: { [Op.notIn]: calculatedAssociationIds },
      },
    }),
  ]);

  // Ensure that all joins exist between primary instance and the secondary models
  // TODO ensure this does not create duplicates
  await calculatedPrimaryInstance[`add${pascalPluralCase(secondaryModel)}`](
    expectedSecondaryModels,
  );
}
