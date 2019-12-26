// migrationTypes
import { SEQUELIZE_ENUM_NAME_REGEX } from '../changeEnumAttributes/regexs';

// local
const {
  ATTRIBUTE_VALUE_REGEX,
  ATTRIBUTE_VALIDATOR_REGEX,
} = require('./regexs');

/**
 * Replace part of the definition using a regex
 *
 * @param repo - The repository configuration
 * @param definition - The raw definition
 * @param path - The path where the definition is
 * @param regex - The regex to extract with
 * @param index - The index in the regex of the extracted value
 * @returns The definition with replace content
 */
function replaceDefinitionWithRegex(
  repo,
  definition: string,
  path: string,
  regex: RegExp,
  index = 1,
): string {
  let useDefinition = definition;

  // Check if the definition matches the regex
  if (regex.test(definition)) {
    // Get the configuration for the item to replace
    const regexMatch = regex.exec(definition);
    const name = regexMatch[index];
    // TODO replace paths
    const enumConfig = repo.getConfigForImport(path, name);

    // Get the replacement definition
    let replaceDefinition = enumConfig.content
      .split('=')
      .pop()
      .trim();
    if (replaceDefinition.endsWith(';')) {
      replaceDefinition = replaceDefinition.slice(
        0,
        replaceDefinition.length - 1,
      );
    }

    // Replace the value in the definition
    useDefinition = definition.replace(name, replaceDefinition);
  }
  return useDefinition;
}

/**
 * Get the definition of an attribute from its file
 *
 * @param repo - The repository configuration
 * @param path - The path to the attributes file
 * @param columnName - The name of the attribute
 * @returns The comment and definition
 */
export const getAttributeFileDefinition = function getAttributeFileDefinition(
  repo,
  path: string,
  columnName: string,
): string[] {
  // Read in the attributes
  const content = repo.readEntryFile(path);
  const [attr] = repo
    .listEntryExportsConfig(path)
    .filter(({ name }) => name === columnName);

  // Build a regex to pull out the attribute definition
  const regex = ATTRIBUTE_VALUE_REGEX(
    columnName,
    repo.moduleSystem === MODULE_SYSTEM.commonjs
      ? 'export const '
      : 'export const ',
  );

  // Pull out the part of the file related to the attribute
  const useContent = attr
    ? content
        .split('\n')
        .slice(attr.startLine, content.length)
        .join('\n')
    : content;

  // Pull out the comment and definition
  let [, comment, definition] = regex.exec(useContent); // eslint-disable-line prefer-const

  // Check for and import enum definition if exists
  definition = replaceDefinitionWithRegex(
    repo,
    definition,
    path,
    SEQUELIZE_ENUM_NAME_REGEX,
  );

  // Check for and import validator definition if exists
  definition = replaceDefinitionWithRegex(
    repo,
    definition,
    path,
    ATTRIBUTE_VALIDATOR_REGEX,
  );
  return [comment, definition.trim()];
};
