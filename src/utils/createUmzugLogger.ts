// global
import { IS_TEST, LOG_SKIPS } from '@wildebeest/constants';
import Logger from '@wildebeest/Logger';

/**
 * Only log every 10th migration in test mode
 */
export const BASE_100_MIGRATIONS_REGEX = /== ([0-9][0-9]00).+?\(.+?s\)/;

/**
 * Create a logging function to use with umzugs
 *
 * @param logger - The logger to use
 * @returns A logging function that can be used to initalize umzug
 */
export default function createUmzugLogger(
  logger: Logger,
): (info: string) => void {
  return (info: string): void => {
    // The logging function to use
    const func =
      info.includes(': migrated') || info.includes(': reverted')
        ? 'success'
        : 'info';

    // Whether to skip
    let skip = LOG_SKIPS.filter((tx) => info.includes(tx)).length > 0;
    const isBase100 = BASE_100_MIGRATIONS_REGEX.test(info);

    // In test mode only show every 10 migration
    if (IS_TEST) {
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
  };
}
