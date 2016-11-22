/*!
 * connect-timeout
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 */

var createError = require('http-errors')
var ms = require('ms')
var onFinished = require('on-finished')
var onHeaders = require('on-headers')

/**
 * Module exports.
 */

module.exports = timeout

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

function timeout (time, options) {
  var opts = options || {}

  var delay = typeof time === 'string'
    ? ms(time)
    : Number(time || 5000)

  var respond = opts.respond === undefined || opts.respond === true

  return function (req, res, next) {
    var id = setTimeout(function () {
      req.timedout = true
      req.emit('timeout', delay)
    }, delay)

    if (respond) {
      req.on('timeout', onTimeout(delay, next))
    }

    req.clearTimeout = function () {
      clearTimeout(id)
    }

    req.timedout = false

    onFinished(res, function () {
      clearTimeout(id)
    })

    onHeaders(res, function () {
      clearTimeout(id)
    })

    next()
  }
}

function onTimeout (delay, cb) {
  return function () {
    cb(createError(503, 'Response timeout', {
      code: 'ETIMEDOUT',
      timeout: delay
    }))
  }
}
