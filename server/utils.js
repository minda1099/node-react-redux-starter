'use strict';

const _ = require('lodash');
const glob = require('glob');

module.exports.getGlobbedFiles = (globPatterns, removeRoot) => {
  // For context switchin g
  const _this = this;

  // URL paths regex
  const urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

  // The output array
  const output = ((_this, urlRegex) => {

    // If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob 
    if (_.isArray(globPatterns)) {
      globPatterns.forEach((globPattern) => {
        return _.union(output, _this.getGlobbedFiles(globPattern, removeRoot));
      });
    } else if (_.isString(globPatterns)) {
      if (urlRegex.test(globPatterns)) {
        return globPatterns;
      } else {
        const files = glob.sync(globPatterns);
        if (removeRoot) {
          files = files.map((file) => {
            return file.replace(removeRoot, '');
          });
        }
        return _.union([], files);
      }
    }
  })(_this, urlRegex);

  return output;


};
