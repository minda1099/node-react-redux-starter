'use strict';

module.exports = (express, app, config) => {

  app.get('/', (req, res, next) => {
    res.render("index", {});
  });
  // Catch all route to handle all SPA requests (last in routes list)
  app.get('*', (req, res) => {
    res.render("index", {});
  });
};