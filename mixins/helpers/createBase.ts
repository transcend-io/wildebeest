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
 * @param createBaseFile - A function to construct the base model file (usually handlebars compiled template)
 * @param config - The config for generating mixins
 */
export default function createBase(
  associationsDefinition: AssociationsDefinition,
  createBaseFile: (input: BaseFileInput) => void,
  config: Required<GenerateMixinsConfig>,
): void {
  // convert into input sections for the handlebars template
  const allAssociations = associationDefinitionToSections(
    associationsDefinition,
    config,
  );

  // Get te file path with
  const splitter = associationsDefinition.filePath.split('/');
  if (splitter[splitter.length - 1] === config.associationFileName) {
    splitter.pop();
  }

  const compiled = createBaseFile({
    ...config.determineModelToExtend(associationsDefinition, config),
    sections: allAssociations,
  });

  writeFileSync(
    join(splitter.concat([config.baseFileName]).join('/')),
    compiled,
  );
}
