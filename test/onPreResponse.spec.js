const expect = require('expect.js');
const rewire = require('rewire');
const plugin = rewire('../src/plugin.js');

describe('onPreResponse', () => {
  describe('200 Status Code', () => {
    const incrementName = [];
    const timingName = [];
    const statsdCall = {
      increment: ['response.out.200.test.endpoint'],
      timing: [{name: 'request.200.test.endpoint'}]
    };
    describe('Plugin', () => {
      before(function(done) {
        const settings = {
          host: 'statsd.localhost',
          prefix: 'search-api-node.development.local.',
          port: 8125,
          debug: true
        };
        plugin.register({
          ext(_, handler) {
            if (_ !== 'onPreResponse') {
              return;
            }
            plugin.__set__('sdc', {
              increment(name) {
                incrementName.push(name);
              },
              timing(name, value) {
                timingName.push({name, value});
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
              continue() {
                done();
              }
            });
          }
        }, settings, () => {});
      });

      describe('Increment', () => {
        statsdCall.increment.forEach(function(value, i) {
          it(`Counter should equal '${value}'`, () => {
            expect(value).to.equal(incrementName[i]);
          });
        });
      });
      describe('Timing', () => {
        statsdCall.timing.forEach(function(value, i) {
          it(`Timer should equal '${statsdCall.timing[i].name}'`, () => {
            expect(timingName[i].name).to.equal(statsdCall.timing[i].name);
            expect(timingName[i].value).to.exist;
          });

          it('Timer should pass a number', () => {
            expect(!isNaN(timingName[i].value)).to.be.true;
          });
        });
      });
    });
  });

  describe('When part of the URL contains dots, for ex` IP address', () => {
    const incrementName = [];
    const timingName = [];
    const statsdCall = {
      increment: ['response.out.200.api.v1.IP.123++123++123++123'],
      timing: [{ name: 'request.200.api.v1.IP.123++123++123++123'}]
    };
    describe('Plugin', () => {
      before(function(done) {
        const settings = {
          host: 'statsd.localhost',
          prefix: 'search-api-node.development.local.',
          port: 8125,
          debug: true
        };
        plugin.register({
          ext(_, handler) {
            if (_ !== 'onPreResponse') {
              return;
            }
            plugin.__set__('sdc', {
              increment(name) {
                incrementName.push(name);
              },
              timing(name, value) {
                timingName.push({name, value});
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
              continue() {
                done();
              }
            });
          }
        }, settings, () => {});
      });

      describe('Increment', () => {
        statsdCall.increment.forEach(function(value, i) {
          it(`Counter should equal '${value}'`, () => {
            expect(value).to.equal(incrementName[i]);
          });
        });
      });
      describe('Timing', () => {
        statsdCall.timing.forEach(function(value, i) {
          it(`Timer should equal '${statsdCall.timing[i].name}'`, () => {
            expect(timingName[i].name).to.equal(statsdCall.timing[i].name);
            expect(timingName[i].value).to.exist;
          });

          it('Timer Should pass a number', () => {
            expect(!isNaN(timingName[i].value)).to.be.true;
          });
        });
      });
    });
  });

  describe('500 Status Code', () => {
    const incrementName = [];
    const timingName = [];
    const statsdCall = {
      increment: ['response.out.500.test.endpoint'],
      timing: [{name: 'request.500.test.endpoint'}]
    };
    describe('Plugin', () => {
      before(function(done) {
        const settings = {
          host: 'statsd.localhost',
          prefix: 'search-api-node.development.local.',
          port: 8125,
          debug: true
        };
        plugin.register({
          ext(_, handler) {
            if (_ !== 'onPreResponse') {
              return;
            }
            plugin.__set__('sdc', {
              increment(name) {
                incrementName.push(name);
              },
              timing(name, value) {
                timingName.push({name, value});
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
              continue() {
                done();
              }
            });
          }
        }, settings, () => {});
      });

      describe('Increment', () => {
        statsdCall.increment.forEach(function(value, i) {
          it(`Counter should equal '${value}'`, () => {
            expect(value).to.equal(incrementName[i]);
          });
        });
      });
      describe('Timing', () => {
        statsdCall.timing.forEach(function(value, i) {
          it(`Timer should equal '${statsdCall.timing[i].name}'`, () => {
            expect(timingName[i].name).to.equal(statsdCall.timing[i].name);
            expect(timingName[i].value).to.exist;
          });

          it('Timer Should pass a number', () => {
            expect(!isNaN(timingName[i].value)).to.be.true;
          });
        });
      });
    });
  });

  describe('When part of the URL contains dots, for ex` IP address With option removePath eql to 1', () => {
    const incrementName = [];
    const timingName = [];
    const statsdCall = {
      increment: ['response.out.200.api.v1.IP'],
      timing: [{name: 'request.200.api.v1.IP'}]
    };
    describe('Plugin', () => {
      before(function(done) {
        const settings = {
          host: 'statsd.localhost',
          prefix: 'search-api-node.development.local.',
          port: 8125,
          debug: true,
          removePath: {
            number: 1,
            regex: '[0-9]{1,3}'
          }
        };
        plugin.register({
          ext(_, handler) {
            if (_ !== 'onPreResponse') {
              return;
            }
            plugin.__set__('sdc', {
              increment(name) {
                incrementName.push(name);
              },
              timing(name, value) {
                timingName.push({name, value});
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
              continue() {
                done();
              }
            });
          }
        }, settings, () => {});
      });

      describe('Increment', () => {
        statsdCall.increment.forEach(function(value, i) {
          it(`Counter should equal '${value}'`, () => {
            expect(value).to.equal(incrementName[i]);
          });
        });
      });
      describe('Timing', () => {
        statsdCall.timing.forEach(function(value, i) {
          it(`Timer should equal '${statsdCall.timing[i].name}'`, () => {
            expect(timingName[i].name).to.equal(statsdCall.timing[i].name);
            expect(timingName[i].value).to.exist;
          });

          it('Timer Should pass a number', () => {
            expect(!isNaN(timingName[i].value)).to.be.true;
          });
        });
      });
    });
  });
});
