// external modules
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';

// global
import {
  ConfiguredModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';
import expectedColumnNames from '@wildebeest/utils/expectedColumnNames';
import listColumns from '@wildebeest/utils/listColumns';

// classes
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
 * @returns Any errors related to all column definitions in the table
 */
export default async function checkColumnDefinitions<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  model: ConfiguredModelDefinition<StringKeys<TModels>>,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Compare columns to what exist
  const expectedColumns = expectedColumnNames(
    model.attributes,
    model.rawAssociations,
  );
  const existingColumns = await listColumns(wildebeest.db, model.tableName);

  // Extra check
  const extraColumns = difference(existingColumns, expectedColumns);
  if (extraColumns.length > 0) {
    errors.push({
      message: `Extra columns: "${extraColumns.join('", "')}" in table: ${
        model.tableName
      }`,
      tableName: model.tableName,
    });
  }

  // Missing check
  const missingColumns = difference(expectedColumns, existingColumns);
  if (missingColumns.length > 0) {
    errors.push({
      message: `Missing columns: "${uniq(missingColumns).join(
        '", "',
      )}" in table: ${model.tableName}`,
      tableName: model.tableName,
    });
  }

  // Check each individual column definition
  const columnErrors = await Promise.all(
    existingColumns.map((name) =>
      checkColumnDefinition(wildebeest, model, name),
    ),
  );

  return errors.concat(...columnErrors);
}
