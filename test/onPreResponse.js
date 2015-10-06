'use strict';

var expect = require('expect.js');
var os = require('os');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');

describe('onPreResponse', function() {
    describe('200 Status Code', function() {
        var incrementName = [];
        var timingName = [];
        var statsdCall = {
            increment: [
                'response.out.Total.counter',
                'response.out.Total.200.counter',
                'response.out.test.endpoint.counter',
                'response.out.test.endpoint.200.counter',
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
                if (_ !== 'onPreResponse'){
                  return;
                }
                plugin.__set__('sdc', {
                  increment: function(name) {
                    incrementName.push(name);
                  },
                  timing: function(name, value) {
                    timingName.push({name : name, value: value});
                  }
                });

                handler({
                  info: {
                    received: new Date()
                  },
                  method: 'get',
                  response: {
                    request: {
                      route: {
                        path: '/test/endpoint',
                        method: 'GET'
                      }
                    },
                    statusCode: 200
                  },
                  url: { pathname: '/test/endpoint' },
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
              statsdCall.increment.forEach(function (value, i){
                it('Counter should be equal : `' + value + '`', function() {
                  expect(value).to.equal(incrementName[i]);
                });
              });
          });
       });
    });

    describe('When part of the URL contains dots, for ex` IP address', function() {
        var incrementName = [];
        var timingName = [];
        var statsdCall = {
            increment: [
                'response.out.Total.counter',
                'response.out.Total.200.counter',
                'response.out.api.v1.IP.123++123++123++123.counter',
                'response.out.api.v1.IP.123++123++123++123.200.counter'
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
                if (_ !== 'onPreResponse') {
                  return;
                }
                plugin.__set__('sdc', {
                  increment: function(name) {
                    incrementName.push(name);
                  },
                  timing: function(name, value) {
                    timingName.push({name : name, value: value});
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
                  url: { pathname: '/api/v1/IP/123.123.123.123' },
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
              statsdCall.increment.forEach(function (value, i){
                it('Counter should be equal : `' + value + '`', function() {
                  expect(value).to.equal(incrementName[i]);
                });
              });
          });
        });
    });

    describe('500 Status Code', function() {
        var incrementName = [];
        var timingName = [];
        var statsdCall = {
            increment: [
                'response.out.Total.counter',
                'response.out.Total.500.counter',
                'response.out.test.endpoint.counter',
                'response.out.test.endpoint.500.counter',
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
                if (_ !== 'onPreResponse') {
                  return;
                }
                plugin.__set__('sdc', {
                  increment: function(name) {
                    incrementName.push(name);
                  },
                  timing: function(name, value) {
                    timingName.push({name : name, value: value});
                  }
                });

                handler({
                  info: {
                    received: new Date()
                  },
                  method: 'get',
                  response: {
                    output: { statusCode: 500 }
                  },
                  url: { pathname: '/test/endpoint' },
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
              statsdCall.increment.forEach(function (value, i){
                it('Counter should be equal : `' + value + '`', function() {
                  expect(value).to.equal(incrementName[i]);
                });
              });
          });
        });
    });
});
