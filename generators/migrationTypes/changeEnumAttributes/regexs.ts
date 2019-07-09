/**
 *
 * ## ChangeEnumAttributes Regexs
 * Regular expressions for the change enum attributes migrationType.
 *
 * @module changeEnumAttributes/regexs
 * @see module:changeEnumAttributes
 */

/**
 * Get the attributes of an enum
 */
module.exports.ENUM_ATTRIBUTE_REGEX = /([a-zA-Z0-9]*)(:| =) '([a-zA-Z0-9]*)',/g;

/**
 * Extract the name and type of enum from an attribute definition
 */
module.exports.SEQUELIZE_ENUM_NAME_REGEX = /DataTypes\.ENUM,\n {2}values: Object\.values\((.+?)\)/;
