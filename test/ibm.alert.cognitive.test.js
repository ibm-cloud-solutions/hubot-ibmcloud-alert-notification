/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
'use strict';

const Helper = require('hubot-test-helper');
const helper = new Helper('../src/scripts');
const expect = require('chai').expect;
const mockUtils = require('./mock.utils.cf.js');
const mockUtilsNotify = require('./mock.utils.notify.js');
const utils = require('../src/lib/utils.js');

const i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	// Add more languages to the list of locales when the files are created.
	directory: __dirname + '/../src/messages',
	defaultLocale: 'en',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');

const validSpace = 'testSpace';
const defaultAlertsContext = 'DEFAULT_ALERT_CONTEXT';

// Passing arrow functions to mocha is discouraged: https://mochajs.org/#arrow-functions
// return promises from mocha tests rather than calling done() - http://tobyho.com/2015/12/16/mocha-with-promises/
describe('Interacting with Alerts via Natural Language', function() {

	let room;
	let cf;

	before(function() {
		mockUtils.setupMockery();
		mockUtilsNotify.setupMockery();
		// initialize cf, hubot-test-helper doesn't test Middleware
		cf = require('hubot-cf-convenience');
		return cf.promise.then();
	});

	beforeEach(function() {
		room = helper.createRoom();
		utils.setAlertContext(room.robot, {spaceConfig: {}});
		let alertContext = {
			spaceConfig: {
				testSpaceGuid: {
					guid: 'testSpaceGuid',
					name: 'testSpace',
					alerts: {
						cpu: {
							enabled: true,
							threshold: 10
						},
						memory: {
							enabled: true,
							threshold: 10
						},
						disk: {
							enabled: true,
							threshold: 10
						},
						event: {
							enabled: true
						}
					}
				}
			}
		};
		room.robot.brain.set(defaultAlertsContext, alertContext);
	});

	afterEach(function() {
		room.destroy();
	});

	context('user sets up alerts', function() {
		it('should respond with no alerts', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('ibm.alert.list.off'));
				done();
			});

			let res = { message: {text: 'Show my alerts'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.list', res, {});
		});

		it('should enable alerts', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('ibm.alert.enabled', 'all', validSpace));
				done();
			});

			let res = { message: {text: 'Enable all alerts'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.enable', res, {type: 'all'});
		});

		it('should fail to enable alerts', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('cognitive.parse.problem.type'));
				done();
			});

			let res = { message: {text: 'Enable alerts'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.enable', res, {});
		});

		it('should disable alerts', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('ibm.alert.disabled.no.alerts', validSpace));
				done();
			});

			let res = { message: {text: 'Disable all alerts'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.disable', res, {type: 'all'});
		});

		it('should fail to disable alerts', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('cognitive.parse.problem.type'));
				done();
			});

			let res = { message: {text: 'Disable alerts'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.disable', res, {});
		});

		it('should enable alerts', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('ibm.alert.enable.and.set.enabled', 'cpu', '10', '%',
				validSpace));
				done();
			});

			let res = { message: {text: 'Enable cpu threshold alerts at 10%'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.enable.and.set', res, {thresholdType: 'cpu', threshold: 10});
		});

		it('should fail to enable alerts due to missing thresholdType', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('cognitive.parse.problem.thresholdType'));
				done();
			});

			let res = { message: {text: 'Enable cpu threshold alerts at 10%'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.enable.and.set', res, {threshold: 10});
		});

		it('should fail to enable alerts due to missing threshold', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('cognitive.parse.problem.threshold'));
				done();
			});

			let res = { message: {text: 'Enable cpu threshold alerts at 10%'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.enable.and.set', res, {thresholdType: 'cpu'});
		});

		it('should set alerts threshold', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('ibm.alert.config.please.enable', 'cpu'));
				done();
			});

			let res = { message: {text: 'Set cpu alert threshold to 10%'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.set.threshold', res, {thresholdType: 'cpu', threshold: 10});
		});

		it('should fail to set alerts threshold missing thresholdType', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('cognitive.parse.problem.thresholdType'));
				done();
			});

			let res = { message: {text: 'Set cpu alert threshold to 10%'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.set.threshold', res, {threshold: 10});
		});

		it('should fail to set alerts threshold missing threshold', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain(i18n.__('cognitive.parse.problem.threshold'));
				done();
			});

			let res = { message: {text: 'Set cpu alert threshold to 10%'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.set.threshold', res, {thresholdType: 'cpu'});
		});
	});

	context('user calls `ibm alert help`', function() {
		it('should respond with help', function(done) {
			room.robot.on('ibmcloud.formatter', (event) => {
				expect(event.message).to.be.a('string');
				expect(event.message).to.contain('hubot ibm alert turn on cpu|memory|disk|crash|all');
				done();
			});

			let res = { message: {text: 'Can you help me with app alerts?'}, user: {id: 'anId'}, response: room };
			room.robot.emit('ibmcloud.alert.notification.help', res, {});
		});
	});
});
