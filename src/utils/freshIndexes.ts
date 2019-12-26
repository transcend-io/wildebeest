// external modules
import { ModelOptions } from 'sequelize';

/**
 * Copy over indexes to new object. This is to ensure that any inherited options are not just a reference to another tables options.
 *
 * @param options - The db model options to copy
 * @returns The copied options
 */
export default function freshIndexes(options?: ModelOptions): ModelOptions {
  if (!options || !options.indexes) {
    return {};
  }
  return {
    ...options,
    indexes: options.indexes.map((index) => ({ ...index })),
  };
}
