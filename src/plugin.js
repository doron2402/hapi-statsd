'use strict';
var Sdc = require('statsd-client');
var Joi = require('joi');
var sdc;

exports.register = function(plugin, options, next){
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
    return removeDotStartEnd(pathname.replace(/\./g,'++').replace(/\//g,'.'));
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

  var timer = new Date();
  sdc = new Sdc(options);
  plugin.ext('onRequest', function(request, reply) {
    var url = buildUrl(request.url.pathname);
    sdc.increment('request.in.' + url + '.counter');
    sdc.increment('request.in.Total.counter');
    reply.continue();
  });

  plugin.ext('onPreResponse', function(request, reply) {
    var url = buildUrl(request.url.pathname);
    var statusCode = isNaN(request.response.statusCode) ? 0 : request.response.statusCode;
    if (statusCode === 0 && request.response.output && request.response.output.statusCode) {
      statusCode = request.response.output.statusCode;
    }
    sdc.increment('response.out.Total.counter');
    sdc.increment('response.out.Total.' + statusCode + '.counter');
    sdc.increment('response.out.' + url + '.counter');
    sdc.increment('response.out.' + url + '.' + statusCode + '.counter');
    sdc.timing('request.Total.timer',timer);
    sdc.timing('request.' + url + '.timer',timer);
    reply.continue();
  });

  plugin.ext('tail', function(request) {
    var route = request.response.request.route;
    var statusCode = request.response.statusCode;
    sdc.increment('tail.request.in.' + route.method + '.' + route.path + '.counter');
    if (statusCode !== 200) {
      sdc.increment('tail.response.out.error.' + route.method + '.' + route.path + '.' + statusCode + '.counter');
    }
    sdc.increment('tail.response.out.' + route.method + '.' + route.path + '.' + statusCode + '.counter');
  });
  next();
};
