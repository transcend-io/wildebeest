// global
import { Attributes } from '@wildebeest/types';

/**
 * Identity function that will type-enforce attribute definitions
 *
 * @param attributes - The db model attributes
 * @returns The type-enforced attributes
 */
export default function createAttributes<TAttributes extends Attributes>(
  attributes: TAttributes,
): TAttributes {
  return attributes;
}
