// local
import verifyNumberedFiles from './verifyNumberedFiles';

/**
 * Numbered Folder
 *
 * A regex to check for a filename in the form xxxx-name
 *
 * i.e. 0032-my-migration
 */
export const NUMBERED_REGEX = /^(\d\d\d\d)-+[\w-]+(|\.js|\.ts)$/;

/**
 * Helper function to parse out the number from a string input
 *
 * @param item - The item to pull the number from
 * @returns The number for that string
 */
export const parseNumber = (item: string): number => {
  if (!NUMBERED_REGEX.test(item)) {
    throw new Error(`Item does not match regex: "${item}"`);
  }

  return parseInt((NUMBERED_REGEX.exec(item) || [])[1], 10);
};

/**
 * Given a list of potential numbered files or folders (i.e. migrations), filter for those that follow the number pattern
 *
 * @memberof module:utils
 *
 * @param listItems - The raw list items to filter
 * @returns The numbered items in order
 */
export default function getNumberedList(
  listItems: string[],
  verify = true,
  regex = NUMBERED_REGEX,
): string[] {
  // Filter by regex
  const migrations = listItems.filter((item) => regex.test(item));

  // Verify that they are valid
  if (verify) {
    verifyNumberedFiles(migrations);
  }

  return migrations;
}
