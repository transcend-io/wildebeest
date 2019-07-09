/**
 *
 * ## RenameS3Files Prompts
 * Plop prompt definitions for the rename s3 files migration.
 *
 * @module renameS3Files/prompts
 * @see module:renameS3Files
 */

// global
import { NOT_EMPTY_REGEX } from '@generators/regexs';

/**
 * The extension to add to the migration name
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const nameExt = {
  message:
    'Name the migration (will be appended after "rename-s3-files-{{ modelTableName }}-"',
  type: 'name',
};

/**
 * The name of the enum attribute on AWS_BUCKET that identifies which bucket to look for files in
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const bucket = {
  message: "What is the bucket? AWS_BUCKET['??']",
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'bucket is required',
};

/**
 * What attributes should be fetched for each row of the table, used to determine its old and new keys
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const attributes = {
  default: 'id',
  message:
    'What attributes should be fetched for each row of the table, used to determine its old and new keys?',
  type: 'input',
  validate: (value) =>
    NOT_EMPTY_REGEX.test(value) ? true : 'attributes is required',
};

const getAttributes = (attributes) =>
  attributes
    .split(',')
    .map((attr) => attr.trim())
    .map((attr) =>
      attr.startsWith('"') && attr.endsWith('')
        ? attr.slice(1, attr.length - 1)
        : attr,
    );

/**
 * Function for determining the old key
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const getOldKey = {
  default: ({ attributes }) =>
    `({ ${getAttributes(attributes).join(', ')} }) => TODO`,
  message:
    'What is the function that will get the old key from a row in the table?',
  extension: 'hbs',
  type: 'editor',
};

/**
 * Function for determining the new key
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const getNewKey = {
  default: ({ attributes }) =>
    `({ ${getAttributes(attributes).join(', ')} }) => TODO`,
  message:
    'What is the function that will get the new key from a row in the table?',
  extension: 'hbs',
  type: 'editor',
};

/**
 * Determine whether to remove the files that are not found
 *
 * @returns {module:typeDefs~PlopPrompt} The prompt
 */
export const remove = {
  default: false,
  message: 'Remove rows that are missing an s3 file at oldKey?',
  type: 'confirm',
};
