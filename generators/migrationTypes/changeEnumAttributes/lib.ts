/**
 *
 * ## ChangeEnumAttributes Lib
 * Helper functions for the change enum attributes migrationType.
 *
 * @module changeEnumAttributes/lib
 * @see module:changeEnumAttributes
 */

// local
const { ENUM_ATTRIBUTE_REGEX } = require('./regexs');

/**
 * List the attributes of an enum from the content definition
 *
 * @param {string}  content - The enum content
 * @param {boolean} [returnValue=true] - Return the enum value (false means return the key)
 * @returns {string[]} The enum attributes
 */
module.exports.listEnumAttributes = function listEnumAttributes(
  content,
  returnValue = true,
) {
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
