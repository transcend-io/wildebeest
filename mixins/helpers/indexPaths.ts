// external modules
import { CompilerOptions } from 'typescript';

/**
 * Get the typescript configuration in the directory
 *
 * @param compilerOptions - The projects compiler options
 * @returns Mapping from path prefix to actual location, used to resolve aliased paths
 */
export default function indexPaths(
  compilerOptions: CompilerOptions,
): { [k in string]: string } {
  const { paths = {} } = compilerOptions;
  return Object.keys(paths).reduce((map, key) => {
    const replaceWith = paths[key][0];
    // No true wildcard support, just assuming that there is always 1 wildcard and it's '/*'
    // No support for multiple paths per key, either.
    const keyPrefix = key.split('/*')[0];
    const path = replaceWith.split('/*')[0];
    return { ...map, [keyPrefix]: path };
  }, {});
}
