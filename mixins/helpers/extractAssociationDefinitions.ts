// external modules
import * as ts from 'typescript';

// mixins
import {
  AssociationsDefinition,
  AssociationsMapping,
  AssociationType,
  GenerateMixinsConfig,
} from '@mixins/types';

// local
import createCompilerHost from './createCompilerHost';
import serializeAssociationType from './serializeAssociationType';

/**
 * A node with file name
 */
type NodeWithFileName = {
  /** The name of the file being parsed */
  originalFileName: string;
};

/**
 * Generate documentation for all classes in a set of .ts files
 *
 * @param fileNames - The filenames to extract from
 * @param options - The ts compiled options
 * @param config - The mixin configuration definition
 * @returns The association definitions found
 */
export default function extractAssociationDefinitions(
  fileNames: string[],
  options: ts.CompilerOptions,
  config: Required<GenerateMixinsConfig>,
): AssociationsDefinition[] {
  // Build a program using the set of root file names in fileNames
  const host = createCompilerHost(options, fileNames, config.rootPath);
  const program = ts.createProgram(fileNames, options, host);

  // Get the checker, we will use it to find more about classes
  const checker = program.getTypeChecker();

  // Only process a file once
  const processed: { [fileName in string]: boolean } = {};

  // The return results
  const output: AssociationsDefinition[] = [];

  /**
   * Serialize a symbol into a json object
   *
   * @param symbol - The typescript symbol to serialize
   * @param originalFileName - The name of the file where the symbol is defined
   * @returns The entry for the symbol to be used as input to mixin generation
   */
  function serializeSymbol /* tslint:disable:line completed-docs */(
    symbol: ts.Symbol,
    originalFileName: string,
  ): AssociationsDefinition {
    const raw = checker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration,
    );
    const { members } = raw as any;

    // Determine the association configurations
    const associations: Partial<AssociationsMapping> = {};
    Object.values(AssociationType).forEach((type: AssociationType) => {
      associations[type] = serializeAssociationType(
        members.get(type),
        originalFileName,
      );
    });

    return {
      documentation: ts.displayPartsToString(
        symbol.getDocumentationComment(checker),
      ),
      filePath: originalFileName,
      relativePath: originalFileName.split(config.rootPath).pop() as string,
      associations: associations as AssociationsMapping,
    };
  }

  /**
   * Visit nodes finding exported ASSOCIATIONS
   *
   * @param node - The node to visit
   */
  function visit({ parent }: ts.Node): void {
    const { originalFileName } = (parent as any) as NodeWithFileName;

    // Skip the file if not an associations file
    if (!originalFileName.endsWith(config.associationFileName)) {
      return;
    }

    // Only process once
    if (processed[originalFileName]) {
      return;
    }
    processed[originalFileName] = true;

    const anyParent = parent as any;
    const ASS =
      anyParent &&
      anyParent.locals &&
      anyParent.locals.get(config.associationDefinitionName);
    if (ASS) {
      const details = serializeSymbol(ASS, originalFileName);
      // console.log(details);
      output.push(details);
    }
  }

  // Visit every sourceFile in the program
  program.getSourceFiles().forEach((sourceFile) => {
    if (!sourceFile.isDeclarationFile) {
      // Walk the tree to search for classes
      ts.forEachChild(sourceFile, visit);
    }
  });

  return output;
}
