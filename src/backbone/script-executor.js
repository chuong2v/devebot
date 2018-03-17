'use strict';

var Promise = require('bluebird');
var lodash = require('lodash');
var chores = require('../utils/chores.js');

var ScriptExecutor = function(params) {
  var self = this;
  params = params || {};

  var crateID = chores.getBlockRef(__filename);
  var loggingFactory = params.loggingFactory.branch(crateID);
  var LX = loggingFactory.getLogger();
  var LT = loggingFactory.getTracer();

  LX.has('silly') && LX.log('silly', LT.toMessage({
    tags: [ crateID, 'constructor-begin' ],
    text: ' + constructor start ...'
  }));

  var sandboxManager = params.sandboxManager;
  var runhookManager = sandboxManager.getSandboxService('runhookManager', chores.injektorContext);

  var resolveCommand = function(command) {
    command = command || {};
    command = lodash.isString(command) ? JSON.parse(command) : command;
    // rename "command" field -> "name" field
    command.name = command.name || command.command;
    delete command.command;
    // support requestId
    command.requestId = command.requestId || LT.getLogID();
    return command;
  }

  self.executeCommand = function(command, outlet) {
    try {
      command = resolveCommand(command);
    } catch(error) {
      LX.has('error') && LX.log('error', LT.toMessage({
        tags: [ crateID, 'executeCommand', 'invalid-command-object' ],
        text: ' - Invalid command object'
      }));
      outlet.render('error');
      return;
    }

    var reqTr = LT.branch({ key: 'requestId', value: command.requestId });

    LX.has('info') && LX.log('info', reqTr.add({
      commandName: command.name,
      command: command
    }).toMessage({
      tags: [ crateID, 'executeCommand', 'begin' ],
      text: '{commandName}#{requestId} start, details: {command}'
    }));

    var promize;
    if (command.name == 'definition') {
      promize = Promise.resolve().then(function() {
        outlet.render('definition', {
          value: {
            appName: params.appName,
            appInfo: params.appInfo,
            appinfo: params.appInfo, // deprecated
            commands: runhookManager.getDefinitions()
          }
        });
      });
    } else {
      promize = runhookManager.execute(command, { outlet: outlet });
    }

    promize.catch(function(error) {
      LX.has('silly') && LX.log('silly', reqTr.add({
        commandName: command.name
      }).toMessage({
        tags: [ crateID, 'executeCommand', 'failed' ],
        text: '{commandName}#{requestId} is failed'
      }));
    }).finally(function() {
      LX.has('info') && LX.log('info', reqTr.add({
        commandName: command.name
      }).toMessage({
        tags: [ crateID, 'executeCommand', 'done' ],
        text: '{commandName}#{requestId} has done'
      }));
      outlet.render('done');
    });
  };

  LX.has('silly') && LX.log('silly', LT.toMessage({
    tags: [ crateID, 'constructor-end' ],
    text: ' - constructor has finished'
  }));
};

ScriptExecutor.argumentSchema = {
  "$id": "scriptExecutor",
  "type": "object",
  "properties": {
    "appName": {
      "type": "string"
    },
    "appInfo": {
      "type": "object"
    },
    "loggingFactory": {
      "type": "object"
    },
    "sandboxManager": {
      "type": "object"
    }
  }
};

module.exports = ScriptExecutor;
