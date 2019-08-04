// global
import { Associations } from '@wildebeest/types';

/**
 * Identity function to type enforce association configurations
 *
 * @param associations - The association definitions
 * @returns The type enforced associations
 */
export default async function createAssociations<
  TAssociations extends Associations
>(associations: TAssociations): Promise<TAssociations> {
  return associations;
}
