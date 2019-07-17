// external modules
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

// global
import { ConfiguredModelDefinition, ModelMap } from '@wildebeest/types';
import expectedColumnNames from '@wildebeest/utils/expectedColumnNames';
import listColumns from '@wildebeest/utils/listColumns';
import Wildebeest from '@wildebeest/classes/Wildebeest';

// local
import checkColumnDefinition from './columnDefinition';

/**
 * Check that all db model attributes defined by sequelize match the ones in postgres
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The db model to check against
 * @returns True if column definitions are in sync
 */
export default async function checkColumnDefinitions<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  model: ConfiguredModelDefinition,
): Promise<boolean> {
  // Compare columns to what exist
  const expectedColumns = expectedColumnNames(model);
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
    existingColumns.map((name) =>
      checkColumnDefinition(wildebeest, model, name),
    ),
  );
  const columnSynced =
    syncedColumns.filter((isSynced) => !isSynced).length === 0;

  return !isMissingColumns && !hasExtraColumns && columnSynced;
}
