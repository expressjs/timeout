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
    var started = Date.now()
    var id = createTimeout(req, delay)

    if (respond) {
      req.on('timeout', function () {
        next(createError(503, 'Response timeout', {
          code: 'ETIMEDOUT',
          timeout: delay
        }))
      })
    }

    req.clearTimeout = function () {
      clearTimeout(id)
    }

    req.setTimeout = function (newDelay) {
      started = Date.now()
      delay = newDelay
      clearTimeout(id)
      id = createTimeout(req, delay)
    }

    req.addTimeout = function (moreDelay) {
      var actualDelay = req.timeoutLeft() + moreDelay
      delay = delay + moreDelay
      clearTimeout(id)
      id = createTimeout(req, actualDelay)
    }

    req.timeoutLeft = function () {
      var time = delay - (Date.now() - started)
      return (time > 0 ? time : 0)
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
 * Create timeout.
 *
 * @param {stream} req
 * @param {number} delay
 * @private
 */
function createTimeout (req, delay) {
  return setTimeout(function () {
    req.timedout = true
    req.emit('timeout', delay)
  }, delay)
}
