'use strict';

var expect = require('expect.js');
var os = require('os');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');

describe('onPreResponse', function() {
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
    ],
    timing: [
        { name: 'request.Total.timer' },
        { name: 'request.test.endpoint.timer' }
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
          it('Counter should be equal : `' + statsdCall.increment[i] + '`', function() {
            expect(value).to.equal(statsdCall.increment[i]);
          });
        });
    });
    describe('Timing', function(){
      statsdCall.timing.forEach(function(value, i){
        it('Timer Should be equal : `' + statsdCall.timing[i].name + '`', function(){
          expect(timingName[i].name).to.equal(statsdCall.timing[i].name);
          expect(timingName[i].value).to.exist;
        });
      });
    });
  });
});
