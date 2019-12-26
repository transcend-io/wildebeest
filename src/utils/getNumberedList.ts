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
 * Verify that there are no duplicate numbered files and they are ordered 1, 2, ... N
 *
 * ```typescript
 * // Returns true
 * verifyNumberedFiles(['0001-file.ts', '0002-file2.ts']);
 * ```
 *
 * @throws {Error} If migration files are not ordered properly
 * @param files - The list of files to verify
 * @param throwError - Throw an error if invalid
 * @returns When throwError is false and there is an error, this will return what index the conflicts exist at
 */
export function verifyNumberedFiles(files: string[], bottom = 1): number {
  const invalidIndex = -1;

  // Pull off the number
  files
    .map((fil) => fil.split('-')[0])
    // Ensure that the numbers are increasing in order
    .forEach((num, ind) => {
      if (parseInt(num, 10) !== ind + bottom) {
        console.log(parseInt(num, 10), ind + 1);
        throw new Error(
          `Migration file naming convention wrong at ${ind + bottom}`,
        );
      }
    });

  // Return the invalid index if not throwing an error
  return invalidIndex;
}

/**
 * Given a list of potential numbered files or folders (i.e. migrations), filter for those that follow the number pattern
 *
 * @param listItems - The raw list items to filter
 * @returns The numbered items in order
 */
export default function getNumberedList(
  listItems: string[],
  bottom = 1,
  regex = NUMBERED_REGEX,
): string[] {
  // Filter by regex
  const migrations = listItems.filter((item) => regex.test(item));

  // Verify that they are valid
  verifyNumberedFiles(migrations, bottom);

  return migrations;
}
