'use strict';
var Sdc = require('statsd-client');
var Joi = require('joi');

exports.register = function(plugin, options, next){
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
  var sdc = new Sdc(options);
  plugin.ext('onRequest', function(request, reply) {
    var url = request.path.replace(/\//g,'_');
    sdc.increment('request.in.' + url + '.counter');
    sdc.increment('request.in.Total.counter');
    reply.continue();
  });

  plugin.ext('onPreResponse', function(request, reply) {
    var url = request.path.replace(/\//g,'_');
    var statusCode = isNaN(request.response.statusCode) ? 0 : request.response.statusCode;
    sdc.increment('response.out.Total.counter');
    sdc.increment('response.out.Total.' + statusCode + '.counter');
    sdc.increment('request.out.' + url + '.counter');
    sdc.increment('request.out.' + url + '.' + statusCode + '.counter');
    sdc.timing('request.Total.timer',timer);
    sdc.timing('request.' + url + '.timer',timer);
    reply.continue();
  });
  next();
};

exports.register.attributes = {
  name: 'statsd-logger',
  version: '0.1.0'
};
