// external
import { join } from 'path';
import pluralize from 'pluralize';

// mixins
import { GenerateMixinsConfig } from '@mixins/types';

// local
import defaultDetermineModelToExtend from './determineModelToExtend';

/**
 * Define all properties of config
 *
 * @param config - The  raw config
 * @returns The keys of the object preserving type
 */
export default function setConfigDefaults({
  getCustomMixinAttributes = {},
  pluralCase = pluralize,
  singularCase = pluralize.singular,
  baseFileName = 'Base.ts',
  associationFileName = 'definition.ts',
  associationDefinitionName = 'associations',
  tsConfigPath,
  baseModelTemplatePath = join(__dirname, '..', 'base.hbs'),
  determineModelToExtend = defaultDetermineModelToExtend,
  handlebarsHelpers = {},
  ...rest
}: GenerateMixinsConfig): Required<GenerateMixinsConfig> {
  return {
    ...rest,
    handlebarsHelpers,
    determineModelToExtend,
    baseFileName,
    getCustomMixinAttributes,
    singularCase,
    pluralCase,
    baseModelTemplatePath,
    tsConfigPath: tsConfigPath || join(rest.rootPath, 'tsconfig.json'),
    associationFileName,
    associationDefinitionName,
  };
}
