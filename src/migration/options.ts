/**
 *
 * ## Migration Options
 * Db model options for the migration model.
 *
 * @module migration/options
 * @see module:migration
 */

// db
import { HookOptions } from '@bk/db/types';

// local
import { MigrationInstance } from './types';

/**
 * The default model hooks
 */
export const hooks: HookOptions<MigrationInstance> = {
  /**
   * Updates the batch number of a new migration
   *
   * @param migration - The newly created migration
   */
  afterCreate: (migration) => {
    const { batch } = migration.constructor;
    return migration.update({ batch });
  },
  /**
   * The pre hook before the model is destroyed.
   *
   *   1) Updates the batch number of any new migration
   *
   * @param migration - The newly created migration
   */
  beforeDestroy: (migration) => {
    const index = parseInt(migration.name.match(/^\d+/), 10);

    return migration.Model.findAll()
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
