1.9.1 / 2025-07-17
==========

  * deps: on-headers@~1.1.0
    - Fix [CVE-2025-7339](https://www.cve.org/CVERecord?id=CVE-2025-7339) ([GHSA-76c9-3jph-rj3q](https://github.com/expressjs/on-headers/security/advisories/GHSA-76c9-3jph-rj3q))

1.9.0 / 2017-05-16
==================

  * deps: http-errors@~1.6.1
    - Make `message` property enumerable for `HttpError`s
    - deps: setprototypeof@1.0.3
  * deps: ms@2.0.0

1.8.0 / 2016-11-21
==================

  * Remove un-used debug dependency
  * deps: http-errors@~1.5.1
    - Add `HttpError` export, for `err instanceof createError.HttpError`
    - Use `setprototypeof` module to replace `__proto__` setting
    - deps: inherits@2.0.3
    - deps: statuses@'>= 1.3.1 < 2'
    - perf: enable strict mode
  * deps: ms@0.7.2
  * deps: on-headers@~1.0.1
    - perf: enable strict mode

1.7.0 / 2015-08-23
==================

  * Use `on-finished` instead of override socket destroy
    - Addresses memory leaking on keep alive connections
    - Ensures timers always get cleaned up
  * perf: enable strict mode
  * perf: remove argument reassignment
  * perf: use standard option existence check

1.6.2 / 2015-05-11
==================

  * deps: debug@~2.2.0
    - deps: ms@0.7.1
  * deps: ms@0.7.1
    - Prevent extraordinarily long inputs

1.6.1 / 2015-03-14
==================

  * deps: debug@~2.1.3
    - Fix high intensity foreground color for bold
    - deps: ms@0.7.0

1.6.0 / 2015-02-15
==================

  * deps: http-errors@~1.3.1
    - Construct errors using defined constructors from `createError`
    - Fix error names that are not identifiers
    - Set a meaningful `name` property on constructed errors

1.5.0 / 2014-12-30
==================

  * deps: debug@~2.1.1
  * deps: http-errors@~1.2.8
    - Fix stack trace from exported function
  * deps: ms@0.7.0
    - Add `milliseconds`
    - Add `msecs`
    - Add `secs`
    - Add `mins`
    - Add `hrs`
    - Add `yrs`

1.4.0 / 2014-10-16
==================

  * Create errors with `http-errors`
  * deps: debug@~2.1.0
    - Implement `DEBUG_FD` env variable support

1.3.0 / 2014-09-03
==================

  * deps: debug@~2.0.0

1.2.2 / 2014-08-10
==================

  * deps: on-headers@~1.0.0

1.2.1 / 2014-07-22
==================

  * deps: debug@1.0.4

1.2.0 / 2014-07-11
==================

  * Accept string for `time` (converted by `ms`)
  * deps: debug@1.0.3
    - Add support for multiple wildcards in namespaces

1.1.1 / 2014-06-16
==================

  * deps: debug@1.0.2

1.1.0 / 2014-04-29
==================

  * Add `req.timedout` property
  * Add `respond` option to constructor

1.0.1 / 2014-04-28
==================

  * Clear timer on socket destroy
  * Compatible with node.js 0.8
  * deps: debug@0.8.1

1.0.0 / 2014-03-05
==================

  * Genesis from `connect`
