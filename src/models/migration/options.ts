/**
 *
 * ## Migration Options
 * Db model options for the migration model.
 *
 * @module migration/options
 */

// external modules
import { ModelHooks } from 'sequelize/types/lib/hooks';

// global
import { ModelMap } from '@wildebeest/types';

// local
import Migration from './Migration';

const getNumber = (name: string): number =>
  parseInt(name.match(/^\d+/) as any, 10);

/**
 * The default model hooks
 */
export const hooks: Partial<ModelHooks<Migration<ModelMap>>> = {
  /**
   * Updates the batch number of a new migration
   *
   * @param migration - The newly created migration
   */
  afterCreate: async (migration) => {
    const { batch } = Migration;
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

    await Migration.findAll()
      .then((migrations) =>
        migrations.filter(({ name }) => getNumber(name) >= index),
      )
      .then((migrations) =>
        Promise.all(migrations.map((mig) => mig.destroy())),
      );
  },
};
