// global
import { WildebeestModel } from '@wildebeest/classes';
import { HookOptions, ModelMap } from '@wildebeest/types';

/**
 * Create database model hooks for a db model
 *
 * @param hooks - The hooks
 * @returns The type-enforced hooks
 */
export default function createHooks<TModel extends WildebeestModel<ModelMap>>(
  hooks: Partial<HookOptions<TModel>>,
): Partial<HookOptions<TModel>> {
  return hooks;
}
