'use strict';
const path = require('path');

module.exports = (express, app, config) => {

  app.get('/', (req, res, next) => {
    res.set('content-type','text/html');
    res.sendFile(path.join(path.resolve('public'),'index.html'));
    res.end();
  });
  // Catch all route to handle all SPA requests (last in routes list)
  app.get('*', (req, res) => {
    res.set('content-type','text/html');
    res.sendFile(path.join(path.resolve('public'),'index.html'));
    res.end();
  });
};