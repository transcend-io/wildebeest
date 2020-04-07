// global
import { ModelMap } from '@wildebeest/types';
import createHooks from '@wildebeest/utils/createHooks';

// local
import type Migration from './Migration';

const getNumber = (name: string): number =>
  parseInt(name.match(/^\d+/) as any, 10);

/**
 * The default model hooks
 */
export default createHooks<Migration<ModelMap>>({
  /**
   * Updates the batch number of a new migration
   *
   * @param migration - The newly created migration
   */
  afterCreate: async (migration) => {
    const { batch } = migration.constructor as typeof Migration;
    await migration.update({ batch });
  },
  /**
   * The pre hook before the model is destroyed.
   *
   *   1) Updates the batch number of any new migration
   *
   * @param migration - The newly created migration
   */
  beforeDestroy: async (migration) => {
    const index = getNumber(migration.name);

    await (migration.constructor as typeof Migration)
      .findAll()
      .then((migrations) =>
        migrations.filter(({ name }) => getNumber(name) >= index),
      )
      .then((migrations) =>
        Promise.all(migrations.map((mig) => mig.destroy())),
      );
  },
});
