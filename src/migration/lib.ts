/**
 *
 * ## Migration Lib
 * Helper functions for the migration migration.
 *
 * @module migration/lib
 * @see module:migration
 */

// global
import { IS_TEST } from '@bk/constants';
import { VERBOSE } from '@bk/envs';
import { logger } from '@bk/loggers';

// local
import { LOG_SKIPS } from './constants';

/**
 * Only log every 10th migration in test mode
 */
export const BASE_100_MIGRATIONS_REGEX = /== ([0-9][0-9]00).+?\(.+?s\)/;

/**
 * Logs migrations
 *
 * @param {string}  info - The migration message
 */
function logHelper(info): void {
  // The logging function to use
  const func =
    info.includes(': migrated') || info.includes(': reverted')
      ? 'success'
      : 'info';

  // Whether to skip
  let skip = LOG_SKIPS.filter((tx) => info.includes(tx)).length > 0;
  const isBase100 = BASE_100_MIGRATIONS_REGEX.test(info);

  // In test mode only show every 10 migration
  if (IS_TEST && !VERBOSE) {
    skip = skip || info === '' || (info.startsWith('== ') && !isBase100);
  }

  // Determine logging contents
  const txt =
    !isBase100 || !IS_TEST
      ? info
      : `    ${(BASE_100_MIGRATIONS_REGEX.exec(info) || [])[1]}`;

  // Log if not skipping
  if (!skip) {
    logger[func](txt);
  }
}
export const logging = logHelper.bind(logger);

/**
 * Run some code wrapped in a logged header
 *
 * @param {Function}  cb - The code to run
 * @param {string}    header - The header of the log section
 * @returns The section execution promise wrapped in logging
 */
export async function logSection(cb, header = 'Migrations'): Promise<void> {
  // Log start
  if (!IS_TEST) {
    logger.divide();
    logger.bold(`${header}:\n`);
  }

  // Run the cb
  await Promise.resolve(cb());

  // Log finish
  if (!IS_TEST) {
    logger.divide();
  }
}
