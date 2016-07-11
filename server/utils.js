const _ = require('lodash');
const glob = require('glob');

module.exports.getGlobbedFiles = (globPatterns, removeRoot) => {
  // URL paths regex
  const urlRegex = new RegExp('^(?:[a-z]+:)?//', 'i');

  // The output array
  const output = (() => {
    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
    if (_.isArray(globPatterns)) {
      globPatterns.forEach((globPattern) =>
        _.union(output, this.getGlobbedFiles(globPattern, removeRoot))
      );
    } else if (_.isString(globPatterns)) {
      if (urlRegex.test(globPatterns)) {
        return globPatterns;
      }
      let files = glob.sync(globPatterns);
      if (removeRoot) {
        files = files.map((file) =>
          file.replace(removeRoot, '')
        );
      }
      return _.union([], files);
    }
    return null;
  })();
  return output;
};
