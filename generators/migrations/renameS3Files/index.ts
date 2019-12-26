// global
import linkToClass from '@generators/utils/linkToClass';
import { NOT_EMPTY_REGEX } from '@generators/regexs';

// local
import * as prompts from './prompts';

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
 * Change the s3 file naming convention for a table
 */

export default {
  configure: ({ modelTableName, nameExt, modelContainer, model }) => ({
    name: `rename-s3-files-${modelTableName}-${nameExt}`,
    comment: `Change the naming convention of s3 files in ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Change the s3 file naming convention for a table',
  prompts: {
    nameExt: {
      message:
        'Name the migration (will be appended after "rename-s3-files-{{ modelTableName }}-"',
      type: 'name',
    },
    bucket: {
      message: "What is the bucket? AWS_BUCKET['??']",
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'bucket is required',
    },
    attributes: {
      default: 'id',
      message:
        'What attributes should be fetched for each row of the table, used to determine its old and new keys?',
      type: 'input',
      validate: (value) =>
        NOT_EMPTY_REGEX.test(value) ? true : 'attributes is required',
    },
    getOldKey: {
      default: ({ attributes }) =>
        `({ ${getAttributes(attributes).join(', ')} }) => TODO`,
      message:
        'What is the function that will get the old key from a row in the table?',
      extension: 'hbs',
      type: 'editor',
    },
    getNewKey: {
      default: ({ attributes }) =>
        `({ ${getAttributes(attributes).join(', ')} }) => TODO`,
      message:
        'What is the function that will get the new key from a row in the table?',
      extension: 'hbs',
      type: 'editor',
    },
    remove: {
      default: false,
      message: 'Remove rows that are missing an s3 file at oldKey?',
      type: 'confirm',
    },
  },
  type: 'tableMigration',
};
