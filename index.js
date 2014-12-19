/*!
 * connect-timeout
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */

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
  options = options || {};

  if (typeof time !== 'function') { // allow computed
    time = typeof time === 'string'
      ? ms(time)
      : Number(time || 5000);
  }

  var respond = !('respond' in options) || options.respond === true;

  return function(req, res, next) {
    var destroy = req.socket.destroy;

    var computed_time = time;
    req.timeoutValue = typeof time === 'function' ? time(req) : time;

    var id = setTimeout(function(){
      req.timedout = true;
      req.emit('timeout', req.timeoutValue);
    }, req.timeoutValue);

    if (respond) {
      req.on('timeout', onTimeout(req.timeoutValue, next));
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

function onTimeout(time, cb){
  return function(){
    cb(createError(503, 'Response timeout', {
      code: 'ETIMEDOUT',
      timeout: time
    }));
  };
}
