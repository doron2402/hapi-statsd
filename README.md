
Hapi Statsd (Plugin)
==================

Hapi.js Plugin for [statsd](https://github.com/etsy/statsd).

This will track your 
    - Count: incoming Request All
    - Count: incoming Request by path
    - Timing: response for all paths
    - Timing: response by path
    - Count: total response 
    - Count: response by status code
    - Count: response by url
    - Count: response by url and status code

[![Build Status](https://secure.travis-ci.org/doron2402/hapi-statsd.png?branch=master)](http://travis-ci.org/doron2402/hapi-statsd)

Quick tour
----------

```javascript
//SERVER:

server.register([
    register: require('hapi-statsd'),
    options: {
        host: 'statsd.localhost', // your statsd host
        prefix: 'node-app.development.local.', // Prefix
        port: 8125, //must be a number default 8125
        debug: true //could be true/false
    }
])...
```


Github
-------------

Check the [GitHub issues](https://github.com/doron2402/hapi-statsd/issues).


LICENSE
-------

[LICENSE](https://github.com/doron2402/hapi-statsd/blob/master/LICENSE).
