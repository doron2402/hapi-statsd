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
              'tail.request.in.get.api.users.doron.counter',
              'tail.response.out.get.api.users.doron.200.counter'
          ],
          timing: [
            { name: 'request.get.api.users.doron.timer' }
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
                if (_ !== 'tail') {
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
                        path: '/api/users/doron',
                        method: 'GET'
                      }
                    },
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
                });
              }
            }, settings, done);
          });

          describe('Increment', function(){
              statsdCall.increment.forEach(function(value, i){
                it('Counter should be equal : `' + statsdCall.increment[i] + '`', function() {
                  expect(value).to.equal(incrementName[i]);
                });
              });
          });
          describe('Timing', function(){
            statsdCall.timing.forEach(function(value, i){
              it('Timer Should be equal : `' + statsdCall.timing[i].name + '`', function(){
                expect(timingName[i].name).to.equal(statsdCall.timing[i].name);
                expect(timingName[i].value).to.exist;
              });

              it('Timer Should pass a number', function(){
                expect(!isNaN(timingName[i].value)).to.be.true;
              });
            });
        });
    });
  });
  describe('When status code is not 200', function() {
        var incrementName = [];
        var timingName = [];
        var statsdCall = {
            increment: [
              'tail.request.in.get.api.users.doron.counter',
              'tail.response.out.error.get.api.users.doron.500.counter',
              'tail.response.out.get.api.users.doron.500.counter'
          ],
          timing: [
            { name: 'request.get.api.users.doron.timer' }
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
                if (_ !== 'tail') {
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
                        path: '/api/users/doron',
                        method: 'GET'
                      }
                    },
                    statusCode: 500
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
                });
              }
            }, settings, done);
          });

          describe('Increment', function(){
              statsdCall.increment.forEach(function(value, i){
                it('Counter should be equal : `' + statsdCall.increment[i] + '`', function() {
                  expect(value).to.equal(incrementName[i]);
                });
              });
          });
          describe('Timing', function(){
            statsdCall.timing.forEach(function(value, i){
              it('Timer Should be equal : `' + value.name + '`', function(){
                expect(timingName[i].name).to.equal(value.name);
              });

              it('Timer Should pass a number', function(){
                expect(timingName[i].value).to.exist;
                expect(!isNaN(timingName[i].value)).to.be.true;
              });
            });
        });
    });
  });

});
