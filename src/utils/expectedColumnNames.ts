// global
import { Associations, Attributes } from '@wildebeest/types';

// local
import getForeignKeyName from './getForeignKeyName';

/**
 * Determine the expected column names for a model definition
 *
 * @param attributes - The sequelize db model attribute definitions
 * @param associations - The associations for that db model
 * @returns The expected column names
 */
export default function expectedColumnNames<TModelNames extends string>(
  attributes: Attributes = {},
  associations: Associations<TModelNames> = {},
): string[] {
  const { belongsTo = {} } = associations;
  return [
    // The attributes
    ...Object.keys(attributes),
    // The belongs to columns
    ...Object.keys(belongsTo).map((associationName) =>
      getForeignKeyName(belongsTo[associationName], `${associationName}Id`),
    ),
  ];
}
