// external modules
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';
import { ModelAttributeColumnOptions, QueryTypes } from 'sequelize';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import {
  ConfiguredModelDefinition,
  ModelMap,
  StringKeys,
  SyncError,
} from '@wildebeest/types';

// local
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import listIndexNames from '@wildebeest/utils/listIndexNames';

/**
 * Check if the database has an index
 *
 * @param db - The db instance
 * @param name - The name of the index
 * @returns True if the index is defined
 */
export async function hasIndex<TModels extends ModelMap>(
  db: WildebeestDb<TModels>,
  name: string,
): Promise<boolean> {
  const [index] = await db.queryInterface.sequelize.query(
    `
      select
      t.relname as table_name,
      i.relname as index_name,
      a.attname as column_name
    from
      pg_class t,
      pg_class i,
      pg_index ix,
      pg_attribute a
    where
      t.oid = ix.indrelid
      and i.oid = ix.indexrelid
      and a.attrelid = t.oid
      and a.attnum = ANY(ix.indkey)
      and t.relkind = 'r'
      and i.relname = '${name}'
    order by
      t.relname,
      i.relname;
  `,
    {
      type: QueryTypes.SELECT,
    },
  );
  return !!index;
}

/**
 * Check that db model indexes are setup properly
 *
 * @memberof module:checks
 *
 * @param wildebeest - The wildebeest configuration
 * @param model - The database model definition to verify
 * @returns Any errors related to db indexes
 */
export default async function checkIndexes<TModels extends ModelMap>(
  { db, namingConventions }: Wildebeest<TModels>,
  {
    options,
    attributes,
    tableName,
  }: ConfiguredModelDefinition<StringKeys<TModels>>,
): Promise<SyncError[]> {
  // Keep track of errors
  const errors: SyncError[] = [];

  // Get the indexes
  const { indexes = [] } = options;

  // Get the existing indexes
  const existingIndexes = await listIndexNames(db, tableName);

  // Get the expected indexes
  const expectedIndexes = indexes.map(({ fields }) =>
    namingConventions.fieldsConstraint(tableName, fields || []).slice(0, 63),
  );
  Object.keys(attributes).forEach((columnName) => {
    const column = attributes[columnName] as (
      | string
      | ModelAttributeColumnOptions);
    if (typeof column === 'object' && column.primaryKey) {
      expectedIndexes.push(namingConventions.primaryKey(tableName));
    } else if (typeof column === 'object' && column.unique) {
      expectedIndexes.push(
        namingConventions.uniqueConstraint(tableName, columnName),
      );
    }
  });

  // Look for missing indexes
  const missingIndexes = difference(expectedIndexes, existingIndexes);
  if (missingIndexes.length > 0) {
    errors.push({
      message: `Missing indexes: "${uniq(missingIndexes).join(
        '", "',
      )}" in table: ${tableName}`,
      tableName,
    });
  }

  // Look for extra indexes
  const extraIndexes = difference(existingIndexes, expectedIndexes);
  if (extraIndexes.length > 0) {
    errors.push({
      message: `Extra indexes: "${uniq(extraIndexes).join(
        '", "',
      )}" in table: ${tableName}`,
      tableName,
    });
  }

  // Valid if all expected indexes exist
  return errors;
}
