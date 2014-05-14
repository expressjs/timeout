
var http = require('http');
var request = require('supertest');
var timeout = require('..');

describe('timeout()', function(){
  describe('when below the timeout', function(){
    it('should do nothing', function(done){
      var server = createServer(null, function(req, res){
        res.end('Hello')
      })
      request(server)
      .get('/')
      .expect(200, 'Hello', done)
    })
  })

  describe('when above the timeout', function(){
    describe('with no response made', function(){
      it('should respond with 503 Request timeout', function(done){
        var server = createServer(null, null, function(req, res){
          req.timedout.should.be.true
          res.end('Hello')
        })

        request(server)
        .get('/')
        .expect(503, done)
      })

      it('should pass the error to next()', function(done){
        var server = createServer(null, null, function(req, res){
          req.timedout.should.be.true
          res.end('Hello')
        })

        request(server)
        .get('/')
        .expect('Response timeout after 100ms', done);
      })
    })

    describe('with a partial response', function(){
      it('should do nothing', function(done){
        var server = createServer(null,
          function(req, res){ res.write('Hello') },
          function(req, res){
            req.timedout.should.be.false
            res.end(' World')
          })

        request(server)
        .get('/')
        .expect(200, 'Hello World', done)
      })
    })
  })

  describe('options', function(){
    it('can disable auto response', function(done){
      var server = createServer({respond: false}, null, function(req, res){
        res.end('Timedout ' + req.timedout)
      })

      request(server)
      .get('/')
      .expect(200, 'Timedout true', done)
    })
  })

  describe('req.clearTimeout()', function(){
    it('should revert this behavior', function(done){
      var server = createServer(null,
        function(req, res){ req.clearTimeout() },
        function(req, res){
          req.timedout.should.be.false
          res.end('Hello')
        })

      request(server)
      .get('/')
      .expect(200, 'Hello', done)
    })
  })

  describe('destroy()', function(){
    it('req should clear timer', function(done){
      var server = createServer(null,
        function(req, res){ req.destroy() },
        function(req, res){
          error.code.should.equal('ECONNRESET')
          req.timedout.should.be.false
          done()
        })
      var error;

      request(server)
      .get('/')
      .end(function(err){
        error = err
      });
    })

    it('res should clear timer', function(done){
      var server = createServer(null,
        function(req, res){ res.destroy() },
        function(req, res){
          error.code.should.equal('ECONNRESET')
          req.timedout.should.be.false
          done()
        })
      var error;

      request(server)
      .get('/')
      .end(function(err){
        error = err
      });
    })

    it('socket should clear timer', function(done){
      var server = createServer(null,
        function(req, res){ req.socket.destroy() },
        function(req, res){
          error.code.should.equal('ECONNRESET')
          req.timedout.should.be.false
          done()
        })
      var error;

      request(server)
      .get('/')
      .end(function(err){
        error = err
      });
    })
  })
})

function createServer(options, before, after) {
  var _timeout = timeout(100, options)

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
        setTimeout(function(){
          after(req, res)
        }, 200)
      }
    })
  })
}
