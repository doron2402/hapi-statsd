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
    var url = request.url.pathname.replace(/\//g,'.');
    url = removeDotStartEnd(url);
    sdc.increment('request.in.' + url + '.counter');
    sdc.increment('request.in.Total.counter');
    reply.continue();
  });

  plugin.ext('onPreResponse', function(request, reply) {
    var url = request.url.pathname.replace(/\//g,'.');
    url = removeDotStartEnd(url);
    var statusCode = isNaN(request.response.statusCode) ? 0 : request.response.statusCode;
    sdc.increment('response.out.Total.counter');
    sdc.increment('response.out.Total.' + statusCode + '.counter');
    sdc.increment('response.out.' + url + '.counter');
    sdc.increment('response.out.' + url + '.' + statusCode + '.counter');
    sdc.timing('request.Total.timer',timer);
    sdc.timing('request.' + url + '.timer',timer);
    reply.continue();
  });
  next();
};
