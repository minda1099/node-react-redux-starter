const path = require('path');

module.exports = (express, app, mongoose, config, utils) => {
  utils.getGlobbedFiles('./server/modules/*/index.js').forEach((routePath) => {
    require(path.resolve(routePath))(express, app, mongoose, config);
  });
};
