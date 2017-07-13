'use strict';

var lab = require('../lab');
var Devebot = lab.getDevebot();
var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');
var debug = Devebot.require('debug');
var assert = require('chai').assert;
var expect = require('chai').expect;
var util = require('util');
var debugx = debug('bdd:devebot:command:runhook:call');
var DevebotApi = require('devebot-api');

describe('devebot:command:runhook:call', function() {
	this.timeout(lab.getDefaultTimeout());

	var app, api;

	before(function() {
		app = lab.getApp();
		api = new DevebotApi(lab.getApiConfig());
	});

	beforeEach(function(done) {
		app.server.start().then(function() {
			done();
		});
	});

	afterEach(function(done) {
		app.server.teardown().then(function() {
			done();
		});
	});

	it('definition should contain runhook-call command', function(done) {
		new Promise(function(resolved, rejected) {
			api.loadDefinition(function(err, defs) {
				if (err) return rejected(err);
				resolved(defs);
			});
		}).then(function(defs) {
			var cmd = lodash.keyBy(defs.commands, 'name')['runhook-call'];
			assert.isNotNull(cmd);
			done();
		});
	});

	it('remote runhook should return correct result', function(done) {
		new Promise(function(resolved, rejected) {
			api.on('failure', function(result) {
				rejected(result);
			});
			api.on('success', function(result) {
				resolved(result);
			});
			api.execCommand({
				name: 'runhook-call',
				options: {
					name: 'plugin1-routine1',
					data: '{ "key": "hello", "value": "world" }'
				}
			});
		}).then(function(result) {
			debugx.enabled && debugx(JSON.stringify(result, null, 2));
			done();
		}).catch(function(error) {
			debugx.enabled && debugx(JSON.stringify(error, null, 2));
			done(error);
		});
	});

	it('direct runhook should return correct result', function(done) {
		new Promise(function(resolved, rejected) {
			api.on('failure', function(result) {
				rejected(result);
			});
			api.on('success', function(result) {
				resolved(result);
			});
			api.execCommand({
				name: 'runhook-call',
				options: {
					name: 'plugin1-routine1',
					mode: 'direct',
					data: '{ "key": "hello", "value": "world" }'
				}
			});
		}).then(function(result) {
			debugx.enabled && debugx(JSON.stringify(result, null, 2));
			done();
		}).catch(function(error) {
			debugx.enabled && debugx(JSON.stringify(error, null, 2));
			done(error);
		});
	});
});
