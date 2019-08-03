// external modules
import transform from 'lodash/transform';
import * as sequelize from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  ConfiguredAssociations,
  ConfiguredAttributes,
  ConfiguredModelDefinition,
  ModelDefinition,
  ModelMap,
  StringKeys,
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
export function createAttributesFromAssociations<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  belongsTo: ConfiguredAssociations<StringKeys<TModels>>['belongsTo'],
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
          associationOptions:
            association.foreignKey &&
            typeof association.foreignKey === 'object' &&
            association.foreignKey.allowNull === false
              ? { onDelete: 'CASCADE' }
              : association,
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
 * @returns The configured seuqlize associations configurations
 */
export default function configureModelDefinition<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  modelName: string,
  {
    tableName,
    attributes = {},
    associations = {},
    options = {},
    skip = false,
    isJoin = false,
    dontMatchBelongsTo = false,
  }: ModelDefinition<StringKeys<TModels>>,
): ConfiguredModelDefinition<StringKeys<TModels>> {
  const {
    belongsTo = {},
    belongsToMany = {},
    hasOne = {},
    hasMany = {},
  } = associations;

  const configuredAssociations = configureAssociations(
    wildebeest,
    modelName,
    associations,
  );
  return {
    tableName: tableName || wildebeest.pluralCase(modelName),
    attributes: {
      ...createAttributesFromAssociations(
        wildebeest,
        configuredAssociations.belongsTo,
      ),
      ...attributes,
    },
    associations: configuredAssociations,
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
