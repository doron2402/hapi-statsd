const expect = require('expect.js');
const rewire = require('rewire');
const plugin = rewire('../src/plugin.js');

describe('onRequest', function() {
  describe('Plugin', function() {
    const incrementName = [];
    const firstIncCall = 'request.in.test.endpoint.counter';
    const secondIncCall = 'request.in.total.counter';
    before(function(done) {
      const settings = {
        host: 'statsd.localhost',
        prefix: 'search-api-node.development.local.',
        port: 8125,
        debug: true
      };
      plugin.register({
        ext(_, handler) {
          if (_ !== 'onRequest') {
            return;
          }

          plugin.__set__('sdc', {
            increment(name) {
              if (_ === 'onRequest') {
                incrementName.push(name);
              }
            },
            timing() { return; }
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
            continue() {
              done();
            }
          });
        }
      }, settings, function() {});
    });
    it('Counter first call should be equal : `' + firstIncCall + '`', function() {
      expect(incrementName[0]).to.equal(firstIncCall);
    });
    it('Counter second call should be equal : `' + secondIncCall + '`', function() {
      expect(incrementName[1]).to.equal(secondIncCall);
    });
  });
  describe('When path name contains dots for ex` ip address', function() {
    const incrementName = [];
    const firstIncCall = 'request.in.api.v1.IP.123++123++123++123.counter';
    const secondIncCall = 'request.in.total.counter';
    before(function(done) {
      const settings = {
        host: 'statsd.localhost',
        prefix: 'search-api-node.development.local.',
        port: 8125,
        debug: true
      };
      plugin.register({
        ext(_, handler) {
          if (_ !== 'onRequest') {
            return;
          }

          plugin.__set__('sdc', {
            increment(name) {
              if (_ === 'onRequest') {
                incrementName.push(name);
              }
            },
            timing() { return; }
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
                    endpoint: 'api/v1/IP',
                    version: 'test-version'
                  }
                }
              }
            }
          }, {
            continue() {
              done();
            }
          });
        }
      }, settings, function() {});
    });
    it('Counter first call should be equal : `' + firstIncCall + '`', function() {
      expect(incrementName[0]).to.equal(firstIncCall);
    });
    it('Counter second call should be equal : `' + secondIncCall + '`', function() {
      expect(incrementName[1]).to.equal(secondIncCall);
    });
  });
});
