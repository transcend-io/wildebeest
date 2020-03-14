/**
 * Get the attributes of an enum
 */
export const ENUM_ATTRIBUTE_REGEX = /([a-zA-Z0-9]*)(:| =) '([a-zA-Z0-9]*)',/g;

/**
 * List the attributes of an enum from the content definition
 *
 * @param content - The enum content
 * @param returnValue - Return the enum value (false means return the key)
 * @returns The enum attributes
 */
export const listEnumAttributes = function listEnumAttributes(
  content: string,
  returnValue = true,
): string[] {
  const attributes = [];
  let attr = ENUM_ATTRIBUTE_REGEX.exec(content);
  while (attr) {
    // Save the key or value
    const [, key, , value] = attr;
    attributes.push(returnValue ? value : key);

    // Get the next
    attr = ENUM_ATTRIBUTE_REGEX.exec(content);
  }
  return attributes;
};
