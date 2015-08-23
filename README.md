
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

STATSD
=======
    - For Ex' [GET] /users/all -> Response [200]
    - onRequest 
        - Count: increment `request.in.users.all.counter'
        - Count: increment `request.in.Total.counter`
    - onPreResponse
        - Count increment `response.out.Total.counter`
        - Count increment `response.out.Total.200.counter`
        - Count increment `response.out.users.all.counter`
        - Count increment `response.out.users.all.200.counter`
        - Timer `request.Total.timer`
        - Timer `request.users.all.timer`

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
