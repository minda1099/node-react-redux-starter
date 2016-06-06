'use strict';
module.exports = require('./secret/' + (process.env.NODE_ENV || 'development') + '.js');