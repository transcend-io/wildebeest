// mixins
import {
  AssociationsDefinition,
  BaseFileInput,
  GenerateMixinsConfig,
} from '@wildebeest/generateMixins/types';

// local
import pascalCase from './pascalCase';

/**
 * Determine the model that the `Base` should extend
 *
 * @param directory - The directory to look for the tsconfig in
 * @param tsConfigPath - The path to the tsconfig if not in the expected tsconfig.json location
 * @returns The tsconfig or throws an error
 */
export default function determineModelToExtend(
  associationsDefinition: AssociationsDefinition,
  config: Required<GenerateMixinsConfig>,
): Omit<BaseFileInput, 'sections'> {
  // Get te file path with
  const split = associationsDefinition.filePath.split('/');
  if (split[split.length - 1] === config.associationFileName) {
    split.pop();
  }

  const [modelBaseFolderRaw, container] = split.slice(-2);
  const modelBaseFolder = ['src', 'models'].includes(modelBaseFolderRaw)
    ? 'db'
    : modelBaseFolderRaw;
  const ModelBaseName =
    modelBaseFolder === 'db'
      ? 'Model'
      : `${pascalCase(config.singularCase(modelBaseFolder))}Model`;

  return {
    container,
    ModelBaseName,
    modelBaseFolder,
    modelDefinitionsPath: config.modelDefinitionsPath,
  };
}
