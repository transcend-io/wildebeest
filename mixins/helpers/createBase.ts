// external modules
import { writeFileSync } from 'fs';
import { join } from 'path';

// mixins
import {
  AssociationsDefinition,
  BaseFileInput,
  GenerateMixinsConfig,
} from '@mixins/types';

// local
import associationDefinitionToSections from './associationDefinitionToSections';

/**
 * Process file
 *
 * @param associationsDefinition - The associations defined for a db mode
 * @param createBaseFile - A function to construct the base model file (usually handlebars compield template)
 * @param config - The config for generating mixins
 */
export default function createBase(
  associationsDefinition: AssociationsDefinition,
  createBaseFile: (input: BaseFileInput) => void,
  config: Required<GenerateMixinsConfig>,
): void {
  // convert into input sections for the handelbars template
  const allAssociations = associationDefinitionToSections(
    associationsDefinition,
    config,
  );

  // Get te file path with
  const splt = associationsDefinition.filePath.split('/');
  if (splt[splt.length - 1] === config.associationFileName) {
    splt.pop();
  }

  const compiled = createBaseFile({
    ...config.determineModelToExtend(associationsDefinition, config),
    sections: allAssociations,
  });

  writeFileSync(join(splt.concat([config.baseFileName]).join('/')), compiled);
}
