// external modules
import flatten from 'lodash/flatten';

// global
import { verboseLogger } from '@bk/loggers';

// wildebeest
import createIndex from '@wildebeest/helpers/createIndex';
import defaultFieldsConstraintName from '@wildebeest/helpers/defaultFieldsConstraintName';
import { MigrationDefinition } from '@wildebeest/types';

/**
 * Options for adding a unique constraint index across columns in a table
 */
export type AddUniqueIndexOptions = {
  /** The name of the table to add the unique index took */
  tableName: string;
  /** The fields the unique index should exist over */
  fields: string[];
  /** Override the default constraint name */
  constraintName?: string;
  /** The method to create the index by */
  method?: string;
  /** When true, drop any duplicates that exist across the unique index */
  dropDuplicates?: boolean;
};

/**
 * Add a unique constrain across multiple columns on up, and remove the constraint on down
 *
 * @memberof module:migrationTypes
 *
 * @param options - Options for making a unique constraint across multiple columns
 * @returns The add unique constraint index migrator migrator
 */
export default function addUniqueConstraintIndex(
  options: AddUniqueIndexOptions,
): MigrationDefinition {
  const { tableName, fields, constraintName, dropDuplicates = false } = options;
  // Determine the name of the constraint
  const name = constraintName || defaultFieldsConstraintName(tableName, fields);

  return {
    // Add the unique index
    up: async (db, withTransaction) =>
      withTransaction(async (transactionOptions) => {
        const { queryT } = transactionOptions;
        if (dropDuplicates) {
          const existing = await queryT.select(
            `
          SELECT id,"${fields.join('", "')}" FROM "${tableName}"
        `,
          );

          // Determine how many values have the unique set of attributes
          const counts: { [key in string]: string[] } = {};
          existing.forEach(({ id, ...rest }) => {
            const valToUnique = Object.entries(rest)
              .map(([key, val]) => `${key}--${val}`)
              .join('___');
            if (counts[valToUnique]) {
              counts[valToUnique].push(id);
            } else {
              counts[valToUnique] = [id];
            }
          });

          // Remove duplicates
          const removeIds = flatten(
            Object.values(counts)
              // Find which rows have multiple ids to the unique fields
              .filter((ids) => ids.length > 1)
              // Only save the first
              .map((ids) => ids.slice(1, ids.length)),
          );

          // Log removal and remove
          if (removeIds) {
            verboseLogger.info(
              `Removing "${removeIds.length}" that duplicates`,
            );
            await queryT.delete(tableName, { id: removeIds });
          }
        }
        return createIndex(
          db,
          name,
          {
            tableName,
            fields,
            unique: true,
          },
          transactionOptions,
        );
      }),
    // Remove the index
    down: async (db) =>
      db.transaction((transaction) =>
        db.queryInterface.removeIndex(tableName, name, { transaction }),
      ),
  };
}
