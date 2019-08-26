// external modules
const { join } = require('path');
const { readFileSync, writeFileSync } = require('fs');
const glob = require('glob');

// TODO take form checks
const ROOTS = [__dirname];

/**
 * Remove JSON Comments from tsconfig
 */
function removeJSONComments(jsonString) {
  return jsonString.replace(/\/\/.*?\n|\/\* .*?\n/g, '');
}

/**
 * Run fix
 */
function fix(fil, dist, compilerOptions) {
  // Read in the file contents
  let fileData = readFileSync(fil, 'utf-8');

  // Determine the relative path of the file to the build base
  const diff = fil.replace(`${dist}/`, '');

  // Determine relative pass to build
  const relativeToBuild = '../'.repeat(diff.split('/').length - 1) || './';

  Object.entries(compilerOptions.paths).forEach(([key, [rep]]) => {
    // The require statements to replace
    const keyPrefix = key.split('/*')[0];

    // Create a regex to find all matches
    const MATCH_REGEX = new RegExp(`${keyPrefix}/`, 'g');

    // Determine what to replace
    let path = rep.split('/*')[0];
    if (path.startsWith('node_modules/')) {
      path = path.replace('node_modules/', '');
      if (!path.endsWith('/')) {
        path += '/';
      }
    } else if (path.includes('build')) {
      path = `${relativeToBuild}${path}/`;
    } else {
      path = relativeToBuild;
    }

    fileData = fileData.replace(MATCH_REGEX, path);
  });

  writeFileSync(fil, fileData, 'utf-8');
}

/**
 * Convert build
 */
function convertBuild(rootPath) {
  const { compilerOptions } = JSON.parse(
    removeJSONComments(readFileSync(join(rootPath, 'tsconfig.json'), 'utf-8')),
  );
  const dist = join(rootPath, compilerOptions.outDir, 'src');
  const files = glob.sync(`${dist}/**/*.js`);
  const dTsFiles = glob.sync(`${dist}/**/*.d.ts`);
  [...files, ...dTsFiles].map((fil) => fix(fil, dist, compilerOptions));
}

ROOTS.map(convertBuild);
