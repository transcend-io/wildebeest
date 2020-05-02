// global
import { WildebeestModel } from '@wildebeest/classes';
import { HookOptions } from '@wildebeest/types';

/**
 * Create database model hooks for a db model
 *
 * @param hooks - The hooks
 * @returns The type-enforced hooks
 */
export default function createHooks<TModel extends WildebeestModel>(
  hooks: Partial<HookOptions<TModel>>,
): Partial<HookOptions<TModel>> {
  return hooks;
}
