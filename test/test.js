
var assert = require('assert')
var http = require('http')
var request = require('supertest')
var timeout = require('..')

describe('timeout()', function () {
  it('should have a default timeout', function (done) {
    this.timeout(10000)
    var server = createServer()
    request(server)
    .get('/')
    .expect(503, done)
  })

  it('should accept millisecond timeout', function (done) {
    var server = createServer(123)
    request(server)
    .get('/')
    .expect(503, /123ms/, done)
  })

  it('should accept string timeout', function (done) {
    var server = createServer('45ms')
    request(server)
    .get('/')
    .expect(503, /45ms/, done)
  })

  describe('when below the timeout', function () {
    it('should do nothing', function (done) {
      var server = createServer(null, function (req, res) {
        res.end('Hello')
      })
      request(server)
      .get('/')
      .expect(200, 'Hello', done)
    })
  })

  describe('when above the timeout', function () {
    describe('with no response made', function () {
      it('should respond with 503 Request timeout', function (done) {
        var server = createServer(null, null, function (req, res) {
          assert.ok(req.timedout)
          res.end('Hello')
        })

        request(server)
        .get('/')
        .expect(503, done)
      })

      it('should pass the error to next()', function (done) {
        var server = createServer(null, null, function (req, res) {
          assert.ok(req.timedout)
          res.end('Hello')
        })

        request(server)
        .get('/')
        .expect(503, 'Response timeout after 100ms', done)
      })
    })

    describe('with a partial response', function () {
      it('should do nothing', function (done) {
        var server = createServer(null,
          function (req, res) { res.write('Hello') },
          function (req, res) {
            assert.ok(!req.timedout)
            res.end(' World')
          })

        request(server)
        .get('/')
        .expect(200, 'Hello World', done)
      })
    })
  })

  describe('options', function () {
    it('can disable auto response', function (done) {
      var server = createServer({respond: false}, null, function (req, res) {
        res.end('Timedout ' + req.timedout)
      })

      request(server)
      .get('/')
      .expect(200, 'Timedout true', done)
    })
  })

  describe('req.clearTimeout()', function () {
    it('should revert this behavior', function (done) {
      var server = createServer(null,
        function (req, res) { req.clearTimeout() },
        function (req, res) {
          assert.ok(!req.timedout)
          res.end('Hello')
        })

      request(server)
      .get('/')
      .expect(200, 'Hello', done)
    })
  })

  describe('destroy()', function () {
    it('req should clear timer', function (done) {
      var server = createServer(null,
        function (req, res) { req.destroy() },
        function (req, res) {
          assert.equal(error.code, 'ECONNRESET')
          assert.ok(!req.timedout)
          done()
        })
      var error

      request(server)
      .get('/')
      .end(function (err) {
        error = err
      })
    })

    it('res should clear timer', function (done) {
      var server = createServer(null,
        function (req, res) { res.destroy() },
        function (req, res) {
          assert.equal(error.code, 'ECONNRESET')
          assert.ok(!req.timedout)
          done()
        })
      var error

      request(server)
      .get('/')
      .end(function (err) {
        error = err
      })
    })

    it('socket should clear timer', function (done) {
      var server = createServer(null,
        function (req, res) { req.socket.destroy() },
        function (req, res) {
          assert.equal(error.code, 'ECONNRESET')
          assert.ok(!req.timedout)
          done()
        })
      var error

      request(server)
      .get('/')
      .end(function (err) {
        error = err
      })
    })
  })

  describe('when request aborted', function () {
    it('should clear timeout', function (done) {
      var aborted = false
      var server = createServer(null,
        function (req, res) {
          req.on('aborted', function () { aborted = true })
          test.abort()
        },
        function (req, res) {
          assert.ok(aborted)
          assert.ok(!req.timedout)
          done()
        })
      var test = request(server).post('/')
      test.write('0')
    })
  })
})

function createServer (options, before, after) {
  var _ms = 100

  if (typeof options !== 'object') {
    _ms = options
    options = {}
  }

  var _timeout = timeout(_ms, options)

  return http.createServer(function (req, res) {
    _timeout(req, res, function (err) {
      if (err) {
        res.statusCode = err.status || 500
        res.end(err.message + ' after ' + err.timeout + 'ms')
        return
      }

      if (before) {
        before(req, res)
      }

      if (after) {
        setTimeout(function () {
          after(req, res)
        }, (_ms + 100))
      }
    })
  })
}
