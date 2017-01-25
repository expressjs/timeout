/*!
 * connect-timeout
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

var createError = require('http-errors')
var ms = require('ms')
var onFinished = require('on-finished')
var onHeaders = require('on-headers')

/**
 * Module exports.
 * @public
 */

module.exports = timeout

/**
 * Create a new timeout middleware.
 *
 * @param {number|string} [time=5000] The timeout as a number of milliseconds or a string for `ms`
 * @param {object} [options] Additional options for middleware
 * @param {boolean} [options.respond=true] Automatically emit error when timeout reached
 * @return {function} middleware
 * @public
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

/**
 * Create timeout listener function.
 *
 * @param {number} delay
 * @param {function} cb
 * @private
 */

function onTimeout (delay, cb) {
  return function () {
    cb(createError(503, 'Response timeout', {
      code: 'ETIMEDOUT',
      timeout: delay
    }))
  }
}
