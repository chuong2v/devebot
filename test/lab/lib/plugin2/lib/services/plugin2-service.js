'use strict';

var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');
var debugx = Devebot.require('pinbug')('devebot:test:lab:plugin2:plugin2Service');

var Service = function(params) {
  debugx.enabled && debugx(' + constructor begin ...');

  params = params || {};

  var self = this;

  var logger = self.logger = params.loggingFactory.getLogger();

  var pluginCfg = lodash.get(params, ['sandboxConfig', 'plugins', 'plugin2'], {});
  debugx.enabled && debugx('configuration: %s', JSON.stringify(pluginCfg));

  debugx.enabled && debugx(' - constructor end!');
};

Service.argumentSchema = {
  "id": "plugin2Service",
  "type": "object",
  "properties": {
    "sandboxName": {
      "type": "string"
    },
    "sandboxConfig": {
      "type": "object"
    },
    "profileConfig": {
      "type": "object"
    },
    "loggingFactory": {
      "type": "object"
    }
  }
};

module.exports = Service;
