// global
import { IS_TEST } from '@wildebeest/constants';
import Logger from '@wildebeest/Logger';

/**
 * Run some code wrapped in a logged header
 *
 * @param logger - The logger to use
 * @param cb - The code to run
 * @param header - The header of the log section
 * @returns The section execution promise wrapped in logging
 */
export default async function logSection(
  logger: Logger,
  cb: () => any, // eslint-disable-line @typescript-eslint/no-explicit-any
  header = 'Migrations',
): Promise<void> {
  // Log start
  if (!IS_TEST) {
    logger.divide();
    logger.info(`${header}:\n`);
  }

  // Run the cb
  await Promise.resolve(cb());

  // Log finish
  if (!IS_TEST) {
    logger.divide();
  }
}
