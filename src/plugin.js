'use strict';
var Sdc = require('statsd-client');
var Joi = require('joi');
var sdc;

exports.register = function(plugin, options, next){
  var removeElementFromPath = function(str, num) {
    var tmpArr = str.split('.');
    tmpArr.splice(-1,options.removePath.number);
    str = tmpArr.join('.');
    return str;
  };

  var removeLastPath = function(str) {
    if (options.removePath && options.removePath.number > 0) {
      if (options.removePath.regex) {
        var pattern = new RegExp(options.removePath.regex);
        if (pattern.test(str)) {
          str = removeElementFromPath(str, options.removePath.number);
        }
      } else {
        str = removeElementFromPath(str, options.removePath.number);
      }
    }
    return str;
  };

  var removeDotStartEnd = function(str) {
    if (str.charAt(0) === '.') {
      str = str.slice(1,str.length);
    }

    if (str.charAt(str.length-1) === '.') {
      str = str.slice(0, -1);
    }

    return str;
  };

  var buildUrl = function(pathname) {
    return removeLastPath(removeDotStartEnd(pathname.replace(/\./gi,'++').replace(/\//gi,'.')));
  };
  var schemaOptions = Joi.object().options({ abortEarly: false }).keys({
    host: Joi.string(),
    prefix: Joi.string(),
    port: Joi.number().optional(),
    debug: Joi.boolean().optional(),
    tcp: Joi.boolean().optional(),
    socketTimeout: Joi.number().optional()
  });
  var validate = Joi.validate(options, schemaOptions);
  if (!validate) {
    return next(validate.error);
  }

  sdc = new Sdc(options);

  plugin.ext('onRequest', function(request, reply) {
    var url = buildUrl(request.url.pathname);
    sdc.increment('request.in.' + url + '.counter');
    sdc.increment('request.in.Total.counter');
    request.app = request.app || {};
    request.app.statsd = request.app.statsd || {};
    request.app.statsd.timer = new Date();
    reply.continue();
  });

  plugin.ext('onPreResponse', function(request, reply) {
    var url = buildUrl(request.url.pathname);
    var timer = (request.app && request.app.statsd && request.app.statsd.timer) ? request.app.statsd.timer : new Date();
    var deltaTimer = timer instanceof Date ? new Date() - timer : timer;
    var statusCode = isNaN(request.response.statusCode) ? 0 : request.response.statusCode;

    if (statusCode === 0 && request.response.output && request.response.output.statusCode) {
      statusCode = request.response.output.statusCode;
    }
    sdc.increment('response.out.Total.counter');
    sdc.increment('response.out.Total.' + statusCode + '.counter');
    sdc.increment('response.out.' + url + '.counter');
    sdc.increment('response.out.' + url + '.' + statusCode + '.counter');
    sdc.timing('request.' + url + '.' + statusCode + '.timer', deltaTimer);
    reply.continue();
  });

  next();
};
