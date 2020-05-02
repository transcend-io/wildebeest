// external
import transform from 'lodash/transform';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  ConfiguredAssociations,
  ConfiguredAttributes,
  ConfiguredModelDefinition,
  ModelDefinition,
} from '@wildebeest/types';

// local
import configureAssociations from './configureAssociations';
import getAssociationAttribute from './getAssociationAttribute';
import getAssociationColumnName from './getAssociationColumnName';
import getForeignKeyName from './getForeignKeyName';

/**
 * From the belongsTo associations, create any relevant model attributes
 *
 * @param wildebeest - The wildebeest configuration
 * @param belongsTo - The belongs to associations
 */
export function createAttributesFromAssociations(
  wildebeest: Wildebeest,
  belongsTo: ConfiguredAssociations['belongsTo'],
): ConfiguredAttributes {
  return transform(
    belongsTo,
    (acc, association, associationName) => {
      // The column to join on
      const joinOnColumn = getForeignKeyName(association);

      // Get association model attributes
      const oppositeAttributes =
        wildebeest.getModelDefinition(association.modelName).attributes || {};

      return Object.assign(acc, {
        [getAssociationColumnName(association, associationName)]: {
          // Determine what the attribute definition should be
          ...getAssociationAttribute(
            association,
            oppositeAttributes[joinOnColumn],
          ),
          // Indicate we are dealing with an association
          isAssociation: true,
          // The association options
          associationOptions: association,
        },
      });
    },
    {},
  );
}

/**
 * Convert any specially termed association settings into valid sequelize options
 *
 * @param wildebeest - The wildebeest configuration
 * @param modelName - The name of the model being connected
 * @param model - The model definition
 * @returns The configured sequelize associations configurations
 */
export default function configureModelDefinition(
  wildebeest: Wildebeest,
  modelName: string,
  {
    tableName,
    attributes = {},
    associations = {},
    defaultAttributes,
    options = {},
    skip = false,
    isJoin = false,
    dontMatchBelongsTo = false,
  }: ModelDefinition,
): ConfiguredModelDefinition {
  const {
    belongsTo = {},
    belongsToMany = {},
    hasOne = {},
    hasMany = {},
  } = associations;

  const configuredAssociations = configureAssociations(
    wildebeest,
    associations,
  );
  return {
    tableName: tableName || wildebeest.pluralCase(modelName),
    attributes: {
      ...(defaultAttributes || wildebeest.defaultAttributes),
      ...createAttributesFromAssociations(
        wildebeest,
        configuredAssociations.belongsTo,
      ),
      ...attributes,
    },
    associations: configuredAssociations,
    rawAttributes: attributes,
    rawAssociations: {
      belongsTo,
      belongsToMany,
      hasMany,
      hasOne,
    },
    skip,
    options,
    isJoin,
    dontMatchBelongsTo,
  };
}
