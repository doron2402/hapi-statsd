const expect = require('expect.js');
const rewire = require('rewire');
const plugin = rewire('../src/plugin.js');

describe('onRequest', () => {
  describe('Plugin', () => {
    const incrementName = [];
    const firstIncCall = 'request.in.test.endpoint';

    before((done) => {
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
      }, settings, () => {});
    });

    it(`Counter first call should equal '${firstIncCall}'`, () => {
      expect(incrementName[0]).to.equal(firstIncCall);
    });
  });
  describe('When path name contains dots for ex` ip address', () => {
    const incrementName = [];
    const firstIncCall = 'request.in.api.v1.IP.123++123++123++123';

    before((done) => {
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
      }, settings, () => {});
    });

    it(`Counter first call should equal '${firstIncCall}'`, () => {
      expect(incrementName[0]).to.equal(firstIncCall);
    });
  });
});
