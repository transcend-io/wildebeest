// global
import { ModelDefinition } from '@wildebeest/types';

// local
import getAssociationAs from './getAssociationAs';
import getForeignKeyName from './getForeignKeyName';

/**
 * Determine the expected column names for a model definition
 *
 * @param model - The model definitioni to determine the column names for
 * @returns The expected column names
 */
export default function expectedColumnNames({
  attributes,
  associations: { belongsTo = {} },
}: ModelDefinition): string[] {
  return [
    // The attributes
    ...Object.keys(attributes),
    // The belongs to columns
    ...Object.keys(belongsTo).map((associationName) =>
      getForeignKeyName(
        belongsTo[associationName],
        `${getAssociationAs(belongsTo[associationName], associationName)}Id`,
      ),
    ),
  ];
}
