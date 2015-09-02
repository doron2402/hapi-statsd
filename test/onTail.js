'use strict';

var expect = require('expect.js');
var os = require('os');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');

describe('on tail event', function() {
    describe('200 Status Code', function() {
        var incrementName = [];
        var timingName = [];
        var statsdCall = {
            increment: [
                'response.out.Total.counter',
                'response.out.test.endpoint.counter',
                'response.out.test.endpoint.200.counter',
                'response.out.Total.200.counter',
                'request.in.test.endpoint.counter',
                'request.in.Total.counter'
          ]
        };
        describe('Plugin', function() {
          before(function(done){
            var settings = {
              host: 'statsd.localhost',
              prefix: 'search-api-node.development.local.',
              port: 8125,
              debug: true
            };
            plugin.register({
              ext: function(_, handler) {
                console.log(_);
                plugin.__set__('sdc', {
                  increment: function(name) {

                    if (name === 'tail'){
                      incrementName.push(name);
                    }
                  },
                  timing: function(name, value) {
                    return;
                  }
                });

                handler({
                  info: {
                    received: new Date()
                  },
                  method: 'get',
                  response: {
                    statusCode: 200
                  },
                  url: { pathname: '/api/users/doron' },
                  route: {
                    settings: {
                      plugins: {
                        'hapi-statsd': {
                          endpoint: 'test/endpoint',
                          version: 'test-version'
                        }
                      }
                    }
                  }
                }, {
                  continue: function() {
                    done();
                  }
                });
              }
            }, settings, function() {});
          });

          describe('Increment', function(){
              statsdCall.increment.forEach(function(value, i){
                it('Counter should be equal : `' + statsdCall.increment[i] + '`', function() {
                  expect(value).to.equal(statsdCall.increment[i]);
                });
              });
          });
        });
    });
});
