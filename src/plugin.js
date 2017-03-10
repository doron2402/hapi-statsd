const Sdc = require('statsd-client');
const Joi = require('joi');
const _ = require('lodash');

let sdc;

exports.register = function registerStatsdPlugin(plugin, options, next) {
  function removeElementFromPath(str) {
    const tmpArr = str.split('.');
    tmpArr.splice(-1, options.removePath.number);
    str = tmpArr.join('.');
    return str;
  }

  function removeLastPath(str) {
    if (options.removePath && options.removePath.number > 0) {
      if (options.removePath.regex) {
        const pattern = new RegExp(options.removePath.regex);
        if (pattern.test(str)) {
          str = removeElementFromPath(str, options.removePath.number);
        }
      } else {
        str = removeElementFromPath(str, options.removePath.number);
      }
    }
    return str;
  }

  function removeDotStartEnd(str) {
    if (str.charAt(0) === '.') {
      str = str.slice(1,str.length);
    }

    if (str.charAt(str.length - 1) === '.') {
      str = str.slice(0, -1);
    }

    return str;
  }

  function buildUrl(pathname) {
    return removeLastPath(removeDotStartEnd(pathname.replace(/\./gi,'++').replace(/\//gi,'.')));
  }

  const schemaOptions = Joi.object().options({ abortEarly: false }).keys({
    host: Joi.string(),
    prefix: Joi.string(),
    port: Joi.number().optional(),
    debug: Joi.boolean().optional(),
    tcp: Joi.boolean().optional(),
    socketTimeout: Joi.number().optional()
  });

  const validate = Joi.validate(options, schemaOptions);
  if (!validate) {
    return next(validate.error);
  }

  sdc = new Sdc(options);

  plugin.ext('onRequest', function(request, reply) {
    const url = buildUrl(request.url.pathname);
    sdc.increment(`request.in.${url}`);
    _.set(request, 'app.statsd.timer', new Date());
    reply.continue();
  });

  plugin.ext('onPreResponse', function(request, reply) {
    const url = buildUrl(request.url.pathname);
    const timer = _.get(request, 'app.statsd.timer', new Date());
    const deltaTimer = new Date() - timer;
    let statusCode = isNaN(request.response.statusCode) ? 0 : request.response.statusCode;

    if (statusCode === 0 && request.response.output && request.response.output.statusCode) {
      statusCode = request.response.output.statusCode;
    }

    sdc.increment(`response.out.${statusCode}.${url}`);
    sdc.timing(`request.${statusCode}.${url}`, deltaTimer);

    reply.continue();
  });

  return next();
};
