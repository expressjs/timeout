/*!
 * connect-timeout
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var createError = require('http-errors');
var debug = require('debug')('connect:timeout');
var ms = require('ms');
var onHeaders = require('on-headers');

/**
 * Timeout:
 *
 * See README.md for documentation.
 *
 * @param {Number} time
 * @param {Object} options
 * @return {Function} middleware
 * @api public
 */

module.exports = function timeout(time, options) {
  var opts = options || {};

  var delay = typeof time === 'string'
    ? ms(time)
    : Number(time || 5000);

  var respond = !('respond' in opts) || opts.respond === true;

  return function(req, res, next) {
    var destroy = req.socket.destroy;
    var id = setTimeout(function(){
      req.timedout = true;
      req.emit('timeout', delay);
    }, delay);

    if (respond) {
      req.on('timeout', onTimeout(delay, next));
    }

    req.clearTimeout = function(){
      clearTimeout(id);
    };

    req.socket.destroy = function(){
      clearTimeout(id);
      destroy.call(this);
    };

    req.timedout = false;

    onHeaders(res, function(){
      clearTimeout(id);
    });

    next();
  };
};

function onTimeout(delay, cb) {
  return function(){
    cb(createError(503, 'Response timeout', {
      code: 'ETIMEDOUT',
      timeout: delay
    }));
  };
}
