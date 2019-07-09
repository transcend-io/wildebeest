/**
 *
 * ## Rename S3 Files Migration Generator
 * Change the s3 file naming convention for a table
 *
 * @module renameS3Files
 * @see module:renameS3Files/prompts
 */

// global
const linkToClass = require('@generators/utils/linkToClass');

// local
const prompts = require('./prompts');

module.exports = {
  configure: ({ modelTableName, nameExt, modelContainer, model }) => ({
    name: `rename-s3-files-${modelTableName}-${nameExt}`,
    comment: `Change the naming convention of s3 files in ${linkToClass(
      modelContainer,
      model,
    )}`,
  }),
  description: 'Change the s3 file naming convention for a table',
  prompts,
  type: 'tableMigration',
};
