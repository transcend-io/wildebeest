// external modules
import { S3 } from 'aws-sdk';

// global
import Wildebeest from '@wildebeest/classes/Wildebeest';
import WildebeestDb from '@wildebeest/classes/WildebeestDb';
import { MigrationDefinition, ModelMap } from '@wildebeest/types';
import batchProcess from '@wildebeest/utils/batchProcess';
import renameS3File from '@wildebeest/utils/renameS3File';

/**
 * Options for creating a migration that will rename s3 files
 */
export type RenameS3FileOptions<T, TModels extends ModelMap> = {
  /** The name of the file table to rename files for */
  tableName: string;
  /** The name of the bucket to rename files in */
  Bucket: string;
  /** The attributes to get from the db */
  attributes?: string;
  /** Function to get the old file key */
  getOldKey: (file: T, db: WildebeestDb<TModels>) => string;
  /** Function to get the new file key */
  getNewKey: (file: T, db: WildebeestDb<TModels>) => string;
  /** When true, remove files that did not have an associated s3 file */
  remove?: boolean;
  /** Provide a connection to s3, else the default will be used */
  s3?: S3;
};

/**
 * Required file subset
 */
export type File = {
  /** File id */
  id: string;
  /** File mimetype */
  mimetype?: string;
};

/**
 * Change the name of a file on s3
 */
async function moveFile<T, TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  s3: S3,
  file: T & File,
  options: RenameS3FileOptions<T, TModels>,
): Promise<{
  /** Number of renamed */
  renamed?: number;
  /** Number of errors */
  errors?: number;
}> {
  const { remove, Bucket, tableName, getOldKey, getNewKey } = options;

  // Get the old key and the new key
  const oldKey = await Promise.resolve(getOldKey(file, wildebeest.db));
  const newKey = await Promise.resolve(getNewKey(file, wildebeest.db));

  try {
    // Check that the file exists
    await s3.headObject({ Bucket, Key: oldKey }).promise();

    // Rename the file
    await renameS3File(wildebeest, s3, Bucket, oldKey, newKey, file.mimetype);
    return { renamed: 1 };
  } catch (headErr) {
    // When the file does not exist, we just ignore it and handle this later
    if (headErr.code !== 'NotFound') {
      throw headErr;
    } else {
      // Remove the row
      if (remove) {
        await wildebeest.db.queryInterface.bulkDelete(tableName, {
          id: file.id,
        });
      }
      return { errors: 1 };
    }
  }
}

/**
 * Rename s3 files from a table
 * @param db - The database to lookup files in
 * @param options - The rename file options
 * @returns The rename promise
 */
async function renameFiles<T, TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  options: RenameS3FileOptions<T, TModels>,
): Promise<void> {
  const { tableName, s3, attributes = '' } = options;

  // Hold the counts
  let renameCount = 0;
  let errorCount = 0;

  // Loop over the file table, and change the keys from oldKey to newKey
  let useAttributes = attributes;
  if (!attributes.includes('id')) {
    useAttributes = `id${useAttributes ? `,${useAttributes}` : ''}`;
  }
  if (!attributes.includes('mimetype')) {
    useAttributes = `mimetype${useAttributes ? `,${useAttributes}` : ''}`;
  }
  await batchProcess<T & File, TModels>(
    wildebeest,
    tableName,
    { attributes: useAttributes },
    async (file) => {
      const { errors = 0, renamed = 0 } = await moveFile<T & File, TModels>(
        wildebeest,
        s3 || wildebeest.s3,
        file,
        options,
      );
      renameCount += renamed;
      errorCount += errors;
    },
  );

  // Log the number of keys that were renamed and the number that were deleted
  if (renameCount > 0) {
    wildebeest.logger.success(`Successfully renamed "${renameCount}" s3 files`);
  }
  if (errorCount > 0) {
    wildebeest.logger.error(`Failed to find "${errorCount}" s3 files`);
  }
}
/**
 * When the naming convention of files stored on s3 is changed, this migration type will rename the s3 files from one convention to the other,
 *
 * @memberof module:migrationTypes
 *
 * @param options - The options for renaming s3 files belong to a table
 * @returns The rename s3 files migrator
 */
export default function renameS3Files<T, TModels extends ModelMap>(
  options: RenameS3FileOptions<T, TModels>,
): MigrationDefinition<TModels> {
  const { getOldKey, getNewKey, ...rest } = options;
  return {
    up: (wildebeest) =>
      renameFiles(wildebeest, {
        getOldKey,
        getNewKey,
        ...rest,
      }),
    down: (wildebeest) =>
      renameFiles(wildebeest, {
        getNewKey: getOldKey,
        getOldKey: getNewKey,
        ...rest,
      }),
  };
}
