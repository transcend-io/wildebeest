// external
import { join } from 'path';
import * as ts from 'typescript';

// local
import indexPaths from './indexPaths';

/**
 * Check if a file exists
 *
 * @param fileName - The name of the file
 * @returns True if the file exists
 */
function fileExists(fileName: string): boolean {
  return ts.sys.fileExists(fileName);
}

/**
 * Read the contents of a file
 *
 * @param fileName - The name of the file
 * @returns The contents of the file
 */
function readFile(fileName: string): string | undefined {
  return ts.sys.readFile(fileName);
}

/**
 * Get the source file
 *
 * @param fileName - The name of the file
 * @param languageVersion - The script target
 * @returns The file source or undefined
 */
function getSourceFile(
  fileName: string,
  languageVersion: ts.ScriptTarget,
): ts.SourceFile | undefined {
  const sourceText = ts.sys.readFile(fileName);
  return sourceText !== undefined
    ? ts.createSourceFile(fileName, sourceText, languageVersion)
    : undefined;
}

const NOT_FOUND: { [moduleName in string]: boolean } = {};

/**
 * Callback to handle invalid paths - logs and returns a dummy value
 *
 * @param moduleName - The module that could not be resolved
 */
function handleInvalidPath(moduleName: string): void {
  if (NOT_FOUND[moduleName]) {
    return;
  }
  NOT_FOUND[moduleName] = true;
  console.log(`FAILED TO FIND: "${moduleName}"`); // eslint-disable-line no-console
}

/**
 * Create the compiler host that includes path mappings for resolving packages
 *
 * @param options - The compiler options
 * @param moduleSearchLocations - The filenames to search
 * @param directory - The directory of the project that is being run on
 * @returns The compiler host configuration
 */
export default function createCompilerHost(
  options: ts.CompilerOptions,
  moduleSearchLocations: string[],
  directory: string,
): ts.CompilerHost {
  // Index the path rewrites from the compiler options
  const pathMap = indexPaths(options);

  // Calculate the base path for rewrites
  const basePath = join(directory, options.baseUrl || '.');

  /**
   * Resolve the path to a module
   *
   * @param moduleNames - The module names to resolve
   * @param containingFile - The file containing?
   * @returns The paths to the input `moduleNames`
   */
  function resolveModuleNames /* tslint:disable:line completed-docs */(
    moduleNames: string[],
    containingFile: string,
  ): ts.ResolvedModule[] {
    const resolvedModules: ts.ResolvedModule[] = [];
    moduleNames.forEach((moduleName) => {
      // try to use standard resolution
      const result = ts.resolveModuleName(moduleName, containingFile, options, {
        fileExists,
        readFile,
      });
      if (result.resolvedModule) {
        resolvedModules.push(result.resolvedModule);
      } else {
        // check fallback locations
        let found = false;
        moduleSearchLocations.forEach((location) => {
          if (found) {
            return;
          }

          // Pull off the prefix to see if we have this rewrite in our pahts
          const [prefix, ...suffix] = moduleName.split('/');

          // Determine the root module path
          const modulePath = pathMap[prefix]
            ? join(basePath, pathMap[prefix], suffix.join('/'))
            : join(location, moduleName);

          // The paths to check
          const checkPaths = [
            join(modulePath, 'index.ts'),
            modulePath,
            `${modulePath}.ts`,
            `${modulePath}.d.ts`,
          ].map(
            (pathToCheck) =>
              [fileExists(pathToCheck), pathToCheck] as [boolean, string],
          );

          // Take the first match
          const firstMatch = checkPaths.find(([pathExists]) => pathExists);

          // Determine whether match is found and save
          if (firstMatch) {
            found = true;
            resolvedModules.push({ resolvedFileName: firstMatch[1] });
          }
        });
        if (!found) {
          handleInvalidPath(moduleName);
          resolvedModules.push(undefined as any);
        }
      }
    });
    return resolvedModules;
  }
  return {
    getSourceFile,
    getDefaultLibFileName: () => 'lib.d.ts',
    writeFile: (fileName, content) => ts.sys.writeFile(fileName, content),
    getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
    getDirectories: (path) => ts.sys.getDirectories(path),
    getCanonicalFileName: (fileName) =>
      ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
    getNewLine: () => ts.sys.newLine,
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    fileExists,
    readFile,
    resolveModuleNames,
  };
}
