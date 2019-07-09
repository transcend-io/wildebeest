/**
 *
 * ## Migration Options
 * Db model options for the migration model.
 *
 * @module migration/options
 * @see module:migration
 */

// external modules
import { ModelHooks } from 'sequelize/types/lib/hooks';

// local
import Migration from './Migration';

/**
 * The default model hooks
 */
export const hooks: Partial<ModelHooks<Migration>> = {
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
    const index = parseInt(migration.name.match(/^\d+/), 10);

    await Migration.findAll()
      .then((migrations) =>
        migrations.filter(
          ({ name }) => parseInt(name.match(/^\d+/), 10) >= index,
        ),
      )
      .then((migrations) =>
        Promise.all(migrations.map((mig) => mig.destroy())),
      );
  },
};
