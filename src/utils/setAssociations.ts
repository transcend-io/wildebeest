/* eslint-disable no-param-reassign */
// classes
import WildebeestModel from '@wildebeest/classes/WildebeestModel';

// local
import { WildebeestModelName } from '@wildebeest/types';
import apply from './apply';

/**
 * Setup the associations for a db model, saving the association to the class definition of the model
 *
 * TODO Do not set names of model associations dynamically
 * TODO any casting here is needed when ModelMap is made specific in @types override
 *
 * @param Model - The model to set the associations for
 * @returns Returns the model instance with associations set
 */
export default function setAssociations(
  Model: typeof WildebeestModel,
): typeof WildebeestModel {
  // Grab the associations
  const { wildebeest, db, configuredDefinition } = Model;

  // Ensure db is initialized beforehand
  if (!db || !wildebeest || !configuredDefinition) {
    throw new Error(
      `Db model must be initialized before calling "setAssociations"`,
    );
  }
  const { associations } = configuredDefinition;

  // Process `hasMany` associations
  apply(associations.hasMany, (association, associationName) => {
    // Get the child model
    const childModel = db.model(association.modelName) as any;

    // Has many relation
    Model.associations[wildebeest.pluralCase(associationName)] = Model.hasMany(
      childModel,
      association,
    );
  });

  // Process `hasOne` associations
  apply(associations.hasOne, (association, associationName) => {
    // Get the child model
    const childModel = db.model(association.modelName) as any;

    // Has one child relation
    Model.associations[associationName] = Model.hasOne(childModel, association);
  });

  // Process `belongsTo` associations
  apply(associations.belongsTo, (association, associationName) => {
    // Get the child model
    const parentModel = db.model(association.modelName) as any;

    // Belongs to
    Model.associations[associationName] = Model.belongsTo(
      parentModel,
      association,
    );
  });

  // Process `belongsToMany` associations
  apply(associations.belongsToMany, (association, associationName) => {
    // Get the child model
    const associationModel = db.model(
      associationName as WildebeestModelName,
    ) as any;

    // Belongs to
    Model.associations[
      wildebeest.pluralCase(associationName)
    ] = Model.belongsToMany(associationModel, association);
  });

  return Model;
}
