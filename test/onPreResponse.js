'use strict';

var expect = require('expect.js');
var os = require('os');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');

describe.only('onPreResponse', function() {
  describe('counter', function() {
      var incrementName;
      var timingName;
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
                        incrementName = name;
                    },
                    timing: function(name, value) {
                        timingName = {name : name, value: value};
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
                    path: '/test/endpoint',
                    route: {
                        settings: {
                            plugins: {
                                'hapi-statsd': {
                                    endpoint: 'test-endpoint',
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
        it('Counter should be equal : `request.out._test_endpoint.200.counter`', function() {
            expect(incrementName).to.equal('request.out._test_endpoint.200.counter');
        });
        it('Timer Should be equal : `request._test_endpoint.timer`', function(){ 
            expect(timingName.name).to.equal('request._test_endpoint.timer');
            expect(timingName.value).to.exist;
       });
    });
  });
