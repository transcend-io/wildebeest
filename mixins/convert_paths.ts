/**
 * Shim for resolving non-relative paths, allowing imports like:
 *
 * ```
 * import foo from '../../../../path/to/foo'
 * // Equivalent statement:
 * import foo from '@myCoolKeyword/path/to/foo'
 * ```
 *
 * These are based on tsconfig options:
 * - compilerOptions
 *   - baseUrl
 *   - paths
 *
 * Limitations of the current implementation:
 * - Limited support of possible values for `tsconfig.compilerOptions.paths`.
 *   - The `tsconfig.compilerOptions.paths` key MUST end with '/*'.
 *   - The `tsconfig.compilerOptions.paths` value MUST be of length 1 and end with 'src/*'.
 * - Only supports files that are compiled to .js
 *
 * @author awendland
 */

// external
import fs from 'fs';
import { join } from 'path';

const rootPath = join(__dirname, '..', '..');
const tscJson = fs
  .readFileSync(join(rootPath, 'tsconfig.json'), 'utf-8')
  // Remove single-line comments.
  // Comments are allowed in tsconfig.json, but not allowed in standard json format, which `JSON.parse` expects.
  .replace(/\/\/.*?\n|\/\* .*?\n/g, '');

const tsConfig = JSON.parse(tscJson); // semicolon necessary prior to IIFE

(() => {
  const baseUrl = join(rootPath, tsConfig.compilerOptions.baseUrl);
  const moduleProto = Object.getPrototypeOf(module);
  const origRequire = moduleProto.require;

  const { paths } = tsConfig.compilerOptions;
  const pathMap: { [k in string]: string } = Object.keys(paths).reduce(
    (map, key) => {
      const replaceWith = paths[key][0]; // .replace('src', 'build');
      // No true wildcard support, just assuming that there is always 1 wildcard and it's '/*'
      // No support for multiple paths per key, either.
      const keyPrefix = key.split('/*')[0].split('*')[0];
      // tsc compiles src/* to the build root dir, so we want to resolve 'src/foo' to 'foo'
      // which we do here by simply snipping off the 'src'
      let path = replaceWith.split('/*')[0].split('*')[0];
      if (path.startsWith('./')) {
        path = path.replace('./', './build/');
      }

      return { ...map, [keyPrefix]: path };
    },
    {},
  );

  /**
   * Override the require function
   *
   * @param request - The name of the module that is being required
   */
  moduleProto.require = function req(request: string) {
    const specialPathPrefix = Object.keys(pathMap).find((key) =>
      request.startsWith(key),
    );
    if (specialPathPrefix) {
      const existsPath = join(
        baseUrl,
        pathMap[specialPathPrefix],
        request.slice(specialPathPrefix.length),
      );
      // Only supports files that compile to .js extensions
      return origRequire.call(this, `${existsPath}`);
    }
    return origRequire.call(this, request);
  };
})();
