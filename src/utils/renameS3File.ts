// external modules
import { S3 } from 'aws-sdk';

// global
import { ModelMap } from '@wildebeest/types';
import Wildebeest from '@wildebeest/classes/Wildebeest';

/**
 * Rename an s3 file
 *
 * @param Bucket - The name of the s3 bucket
 * @param oldKey - The old key
 * @param newKey - The new key
 * @param mimetype - The mimetype of the file
 * @returns The rename promise
 */
export default async function renameS3File<TModels extends ModelMap>(
  wildebeest: Wildebeest<TModels>,
  s3: S3,
  Bucket: string,
  oldKey: string,
  newKey: string,
  mimetype?: string,
  isDryRun = process.env.DRY_RUN === 'true',
): Promise<void> {
  // The copy parameters
  const copyParams = {
    ...(mimetype ? { ContentType: mimetype } : {}),
    Bucket,
    MetadataDirective: 'REPLACE',
    CopySource: `/${Bucket}/${oldKey}`,
    Key: newKey,
  };

  // Copy the object
  if (isDryRun) {
    wildebeest.logger.info(`Copied: "${oldKey}" to "${newKey}"`);
  } else {
    await s3.copyObject(copyParams).promise();
  }

  // The delete parameters
  const deleteParams = {
    Bucket,
    Delete: { Objects: [{ Key: oldKey }] },
  };

  // Delete the old object
  if (isDryRun) {
    wildebeest.logger.info(`Deleted: "${oldKey}"`);
  } else {
    await s3.deleteObjects(deleteParams).promise();
  }
}
