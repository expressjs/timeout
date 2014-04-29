# connect-timeout [![Build Status](https://travis-ci.org/expressjs/timeout.svg)](https://travis-ci.org/expressjs/timeout) [![NPM version](https://badge.fury.io/js/connect-timeout.svg)](http://badge.fury.io/js/connect-timeout)

Times out the request in `ms`, defaulting to `5000`.

## API

```js
var express = require('express')
var timeout = require('connect-timeout')

var app = express()
app.use(timeout(300))
```

### timeout(ms)

Returns middleware that times out in `ms` milliseconds.

The timeout error is passed to `next()` so that you may customize the response behavior. This error has a `.timeout` property as well as `.status == 503`.

#### req.clearTimeout()

Clears the timeout on the request.

#### req.timedout, res.timedout

`true` if timeout fired; `false` otherwise.

## License

The MIT License (MIT)

Copyright (c) 2014 Jonathan Ong me@jongleberry.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
