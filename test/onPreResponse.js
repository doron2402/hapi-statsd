'use strict';

var expect = require('expect.js');
var os = require('os');
var rewire = require('rewire');
var plugin = rewire('../src/plugin.js');

describe.only('onPreResponse', function() {
  describe('counter', function() {
    before(function(done){
        
    });
    
    it('it should write metrics to statsd', function(done) {
      
    });
  });

  describe('given fully-populated context from validation error', function() {
    it('it should write metrics to statsd', function(done) {
      plugin.register({
        ext: function(_, handler) {
          plugin.__set__('statsd', {
            increment: function(name) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.test-service.test-endpoint-vtest-version.failure.get.400');
            },
            timing: function(name, value) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.test-service.test-endpoint-vtest-version.failure.get.400');
              expect(value).to.be.greaterThan(-1);
            }
          });

          handler({
            headers: {
              'ot-referringservice': 'test-service'
            },
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              output: {
                payload: {
                  statusCode: 400
                }
              }
            },
            route: {
              settings: {
                plugins: {
                  'ot-hapi-request-metrics': {
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
      }, { host: 'test-host', application: 'test-application', environment: 'test-environment', dataCentre: 'test-dataCentre' }, function() {});
    });
  });

  describe('given context with no "ot-referringservice" header', function() {
    it('it should write metrics to statsd', function(done) {
      plugin.register({
        ext: function(_, handler) {
          plugin.__set__('statsd', {
            increment: function(name) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.unknown.test-endpoint-vtest-version.success.get.200');
            },
            timing: function(name, value) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.unknown.test-endpoint-vtest-version.success.get.200');
              expect(value).to.be.greaterThan(-1);
            }
          });

          handler({
            headers: {},
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            route: {
              settings: {
                plugins: {
                  'ot-hapi-request-metrics': {
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
      }, { host: 'test-host', application: 'test-application', environment: 'test-environment', dataCentre: 'test-dataCentre' }, function() {});
    });
  });

  describe('given context with no endpoint setting', function() {
    it('it should write metrics to statsd', function(done) {
      plugin.register({
        ext: function(_, handler) {
          plugin.__set__('statsd', {
            increment: function(name) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.test-service.unknown-vtest-version.success.get.200');
            },
            timing: function(name, value) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.test-service.unknown-vtest-version.success.get.200');
              expect(value).to.be.greaterThan(-1);
            }
          });

          handler({
            headers: {
              'ot-referringservice': 'test-service'
            },
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            route: {
              settings: {
                plugins: {
                  'ot-hapi-request-metrics': {
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
      }, { host: 'test-host', application: 'test-application', environment: 'test-environment', dataCentre: 'test-dataCentre' }, function() {});
    });
  });

  describe('given context with no version setting', function() {
    it('it should write metrics to statsd', function(done) {
      plugin.register({
        ext: function(_, handler) {
          plugin.__set__('statsd', {
            increment: function(name) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.test-service.test-endpoint.success.get.200');
            },
            timing: function(name, value) {
              expect(name).to.equal('test-application.test-environment.test-dataCentre.' + os.hostname().replace(/\./g, '_') + '.http-request-in.test-service.test-endpoint.success.get.200');
              expect(value).to.be.greaterThan(-1);
            }
          });

          handler({
            headers: {
              'ot-referringservice': 'test-service'
            },
            info: {
              received: new Date()
            },
            method: 'get',
            response: {
              statusCode: 200
            },
            route: {
              settings: {
                plugins: {
                  'ot-hapi-request-metrics': {
                    endpoint: 'test-endpoint'
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
      }, { host: 'test-host', application: 'test-application', environment: 'test-environment', dataCentre: 'test-dataCentre' }, function() {});
    });
  });
});
