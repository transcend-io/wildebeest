/**
 * Invert an object so that the values look up the keys.
 * If the object has an array as the value, each item in the array will be inverted.
 *
 * @param obj - The object to invert
 * @returns The inverted object
 */
export default function invert(
  obj: { [key in string]: string | string[] },
): { [key in string]: string } {
  const result: { [key in string]: string } = {};

  // Invert
  Object.keys(obj).forEach((key: string) => {
    const instance = obj[key];
    if (typeof instance === 'string') {
      result[instance] = key;
    } else {
      (obj[key] as string[]).forEach((listKey: string) => {
        result[listKey] = key;
      });
    }
  });
  return result;
}
