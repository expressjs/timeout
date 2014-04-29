/*!
 * Expressjs | Connect - timeout
 * Ported from https://github.com/LearnBoost/connect-timeout
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var debug = require('debug')('connect:timeout');

/**
 * Timeout:
 *
 * See README.md for documentation.
 *
 * @param {Number} ms
 * @return {Function} middleware
 * @api public
 */

module.exports = function timeout(ms) {
  ms = ms || 5000;

  return function(req, res, next) {
    var destroy = req.socket.destroy;
    var id = setTimeout(function(){
      req.emit('timeout', ms);
    }, ms);

    req.on('timeout', function(){
      if (this._header) return debug('response started, cannot timeout');
      var err = new Error('Response timeout');
      err.timeout = ms;
      err.status = 503;
      next(err);
    });

    req.clearTimeout = function(){
      clearTimeout(id);
    };

    req.socket.destroy = function(){
      clearTimeout(id);
      destroy.call(this);
    };

    var writeHead = res.writeHead;
    res.writeHead = function(){
      clearTimeout(id);
      writeHead.apply(res, arguments);
    }

    next();
  };
};
