// external
import { ModelHooks } from 'sequelize/types/lib/hooks';

// global
import { WildebeestModel } from '@wildebeest/classes';
import { ModelMap } from '@wildebeest/types';

/**
 * Create database model hooks for a db model
 *
 * @param hooks - The hooks
 * @returns The type-enforced hooks
 */
export default function createHooks<TModel extends WildebeestModel<ModelMap>>(
  hooks: Partial<ModelHooks<TModel>>,
): Partial<ModelHooks<TModel>> {
  return hooks;
}
