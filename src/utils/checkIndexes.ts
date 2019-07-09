// external modules
import difference from 'lodash/difference';
import uniq from 'lodash/uniq';
import { QueryTypes } from 'sequelize';

// wildebeest
import { SequelizeMigrator } from '@wildebeest/types';

// local
import listIndexNames from './listIndexNames';

/**
 * Check if the database has an index
 *
 * @param db - The db instance
 * @param name - The name of the index
 * @returns True if the index is defined
 */
export async function hasIndex(
  db: SequelizeMigrator,
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
 * @memberof module:migrations/helpers
 *
 * @param model - The database model to verify
 * @returns True if the model has indexes setup matching sequelize definitions
 */
export default async function checkIndexes(model: Model): Promise<boolean> {
  // Get the indexes
  const { indexes = [] } = model.modelOptions;

  // Get the existing indexes
  const existingIndexes = await listIndexNames(model.db, model.tableName);

  // Get the expected indexes
  const expectedIndexes = indexes.map(({ fields }) =>
    defaultFieldsConstraintName(model.tableName, fields).slice(0, 63),
  );
  Object.entries(model.modelAttributes).forEach(
    ([columnName, { primaryKey, unique }]) => {
      if (primaryKey) {
        expectedIndexes.push(`${model.tableName}_pkey`);
      } else if (unique) {
        expectedIndexes.push(`${model.tableName}_${columnName}_key`);
      }
    },
  );

  // Look for missing indexes
  const missingIndexes = difference(expectedIndexes, existingIndexes);
  const hasMissingIndexes = missingIndexes.length > 0;
  if (hasMissingIndexes) {
    logger.error(
      `Missing indexes: "${uniq(missingIndexes).join('", "')}" in table: ${
        model.tableName
      }`,
    );
  }

  // Look for extra indexes
  const extraIndexes = difference(existingIndexes, expectedIndexes);
  const hasExtraIndexes = extraIndexes.length > 0;
  if (hasExtraIndexes) {
    logger.error(
      `Extra indexes: "${uniq(extraIndexes).join('", "')}" in table: ${
        model.tableName
      }`,
    );
  }

  // Valid if all expected indexes exist
  return !hasExtraIndexes && !hasMissingIndexes;
}
