// external modules
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

// wildebeest
import { ModelDefinition } from '@wildebeest/types';
import Wildebeest from '@wildebeest';

// local
import checkColumnDefinition from './checkColumnDefinition';
import listColumns from './listColumns';

/**
 * Check that all db model attributes defined by sequelize match the ones in postgres
 *
 * @memberof module:migrations/helpers
 *
 * @param model - The db model to check against
 * @returns True if column definitions are in sync
 */
export default async function checkColumnDefinitions(
  wildebeest: Wildebeest,
  model: ModelDefinition,
): Promise<boolean> {
  // Compare columns to what exist
  const expectedColumns = model.expectedColumns();
  const existingColumns = await listColumns(wildebeest.db, model.tableName);

  // Extra check
  const extraColumns = difference(existingColumns, expectedColumns);
  const hasExtraColumns = extraColumns.length > 0;
  if (hasExtraColumns) {
    wildebeest.logger.error(
      `Extra columns: "${extraColumns.join('", "')}" in table: ${
        model.tableName
      }`,
    );
  }

  // Missing check
  const missingColumns = difference(expectedColumns, existingColumns);
  const isMissingColumns = missingColumns.length > 0;
  if (isMissingColumns) {
    wildebeest.logger.error(
      `Missing columns: "${uniq(missingColumns).join('", "')}" in table: ${
        model.tableName
      }`,
    );
  }

  // Check each individual column definition
  const syncedColumns = await Promise.all(
    existingColumns.map((name) => checkColumnDefinition(model, name)),
  );
  const columnSynced =
    syncedColumns.filter((isSynced) => !isSynced).length === 0;

  return !isMissingColumns && !hasExtraColumns && columnSynced;
}
