
process.env.NODE_ENV = 'test';

var connect = require('connect');
var request = require('supertest');
var timeout = require('..');

var app = connect()
  .use(timeout(300))
  .use(function(req, res){
    res.end('Hello');
  });

describe('timeout()', function(){
  describe('when below the timeout', function(){
    it('should do nothing', function(done){
      request(app.listen())
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when above the timeout', function(){
    describe('with no response made', function(){
      it('should respond with 503 Request timeout', function(done){
        var app = connect()
          .use(timeout(300))
          .use(function(req, res){
            setTimeout(function(){
              res.timedout.should.be.true;
              res.end('Hello');
            }, 400);
          });

        request(app.listen())
        .get('/')
        .expect(503, done);
      })

      it('should pass the error to next()', function(done){
        var app = connect()
          .use(timeout(300))
          .use(function(req, res){
            setTimeout(function(){
              res.timedout.should.be.true;
              res.end('Hello');
            }, 400);
          })
          .use(function(err, req, res, next){
            res.statusCode = err.status;
            res.end('timeout of ' + err.timeout + 'ms exceeded');
          });

        request(app.listen())
        .get('/')
        .expect('timeout of 300ms exceeded', done);
      })
    })

    describe('with a partial response', function(){
      it('should do nothing', function(done){
        var app = connect()
          .use(timeout(300))
          .use(function(req, res){
            res.write('Hello');
            setTimeout(function(){
              res.timedout.should.be.false;
              res.end(' World');
            }, 400);
          });

        request(app.listen())
        .get('/')
        .expect('Hello World', done);
      })
    })
  })

  describe('options', function(){
    it('can disable auto response', function(done){
      var app = connect()
        .use(timeout(300, {respond: false}))
        .use(function(req, res){
          setTimeout(function(){
            res.end('Timedout ' + res.timedout);
          }, 400);
        });

      request(app.listen())
      .get('/')
      .expect('Timedout true', done);
    })
  })

  describe('req.clearTimeout()', function(){
    it('should revert this behavior', function(done){
      var app = connect()
        .use(timeout(300))
        .use(function(req, res){
          req.clearTimeout();
          setTimeout(function(){
            res.timedout.should.be.false;
            res.end('Hello');
          }, 400);
        });

      request(app.listen())
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('destroy()', function(){
    it('req should clear timer', function(done){
      var app = connect()
        .use(timeout(100))
        .use(function(req, res){
          req.destroy();
          setTimeout(function(){
            error.code.should.equal('ECONNRESET');
            res.timedout.should.be.false;
            done();
          }, 200);
        });
      var error;

      request(app.listen())
      .get('/')
      .end(function(err){
        error = err
      });
    })

    it('res should clear timer', function(done){
      var app = connect()
        .use(timeout(100))
        .use(function(req, res){
          res.destroy();
          setTimeout(function(){
            error.code.should.equal('ECONNRESET');
            res.timedout.should.be.false;
            done();
          }, 200);
        });
      var error;

      request(app.listen())
      .get('/')
      .end(function(err){
        error = err
      });
    })

    it('socket should clear timer', function(done){
      var app = connect()
        .use(timeout(100))
        .use(function(req, res){
          req.socket.destroy();
          setTimeout(function(){
            error.code.should.equal('ECONNRESET');
            req.timedout.should.be.false;
            done();
          }, 200);
        });
      var error;

      request(app.listen())
      .get('/')
      .end(function(err){
        error = err
      });
    })
  })
})
