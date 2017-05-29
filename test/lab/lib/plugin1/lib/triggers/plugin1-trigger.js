'use strict';

var http = require('http');
var Devebot = require('../../../../index').getDevebot();
var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');
var debug = Devebot.require('debug');
var debuglog = debug('devebot:test:lab:plugin1:plugin1Trigger');

var Service = function(params) {
  debuglog.isEnabled && debuglog(' + constructor begin ...');

  params = params || {};

  var self = this;

  self.logger = params.loggingFactory.getLogger();

  var plugin1Cfg = lodash.get(params, ['sandboxConfig', 'plugins', 'plugin1'], {});

  var server = http.createServer();

  server.on('error', function(err) {
    debuglog.isEnabled && debuglog('Server Error: %s', JSON.stringify(err));
  });

  self.getServer = function() {
    return server;
  };

  var configHost = lodash.get(plugin1Cfg, 'host', '0.0.0.0');
  var configPort = lodash.get(plugin1Cfg, 'port', 8080);

  self.start = function() {
    return new Promise(function(resolved, rejected) {
      var serverInstance = server.listen(configPort, configHost, function () {
        var host = serverInstance.address().address;
        var port = serverInstance.address().port;
        console.log('plugin1 webserver is listening at http://%s:%s', host, port);
        resolved(serverInstance);
      });
    });
  };

  self.stop = function() {
    return new Promise(function(resolved, rejected) {
      server.close(function () {
        console.log('plugin1 webserver has been closed');
        resolved();
      });
    });
  };

  debuglog.isEnabled && debuglog(' - constructor end!');
};

Service.argumentSchema = {
  "id": "plugin1Trigger",
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
