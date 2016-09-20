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
const notify = require('../src/lib/ibm.alert.notification.js');
const activity = require('hubot-ibmcloud-activity-emitter');

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
describe('Interacting with Alerts commands via Reg Ex', function() {

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
		// Force all emits into a reply.
		room.robot.on('ibmcloud.formatter', function(event) {
			if (event.message) {
				event.response.reply(event.message);
			}
			else {
				event.response.send({attachments: event.attachments});
			}
		});
	});

	afterEach(function() {
		room.destroy();
	});

	context('user sets up alerts', function() {
		it('should respond with no alerts', function() {
			return room.user.say('mimiron', '@hubot ibm alert list').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('ibm.alert.list.off')]);
			});
		});

		it('should enable and turn off all alerts', function() {
			let alertContext = {
				spaceConfig: {
					testSpaceGuid: {
						guid: 'testSpaceGuid',
						name: 'testSpace',
						alerts: {
							cpu: {
								enabled: true,
								threshold: 85
							},
							memory: {
								enabled: true,
								threshold: 85
							},
							disk: {
								enabled: true,
								threshold: 85
							},
							event: {
								enabled: true
							}
						}
					}
				}
			};
			room.robot.brain.set(defaultAlertsContext, alertContext);

			return room.user.say('mimiron', '@hubot ibm alert enable all').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('ibm.alert.enabled', 'all', validSpace)]);
				return room.user.say('mimiron', '@hubot ibm alert turn off all');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('ibm.alert.disabled', 'all', validSpace)]);
				return room.user.say('mimiron', '@hubot ibm alert list');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('ibm.alert.list.off')]);
			});
		});

		it('should enable and adjust alerts', function() {
			let alertContext = {
				spaceConfig: {
					testSpaceGuid: {
						guid: 'testSpaceGuid',
						name: 'testSpace',
						alerts: {
							cpu: {
								enabled: true,
								threshold: 5
							},
							memory: {
								enabled: true,
								threshold: 5
							},
							disk: {
								enabled: true,
								threshold: 5
							},
							event: {
								enabled: true
							}
						}
					}
				}
			};
			room.robot.brain.set(defaultAlertsContext, alertContext);
			return room.user.say('mimiron', '@hubot ibm alert me when memory exceeds 50%').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('ibm.alert.enable.and.set.enabled', 'memory', '50',
					'%',
					validSpace)]);
				return room.user.say('mimiron', '@hubot ibm alert me if cpu exceeds 10 percent');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot',
					'@mimiron ' + i18n.__('ibm.alert.enable.and.set.enabled', 'cpu', '10', '%',
						validSpace)
				]);
				return room.user.say('mimiron', '@hubot ibm alert set cpu threshold to 50%');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' +
					i18n.__('ibm.alert.config.enabled', 'cpu', '50', '%',
						validSpace)
				]);
				return room.user.say('mimiron', '@hubot ibm alert change memory threshold to 90%');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' +
					i18n.__('ibm.alert.config.enabled', 'memory', '90', '%',
						validSpace)
				]);
				return room.user.say('mimiron', '@hubot ibm alert list');
			}).then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' +
					i18n.__('ibm.alert.list.enabled', validSpace) + ' cpu:50%, memory:90%\n'
				]);
			});
		});

	});

	context('user calls `ibm alert help`', function() {
		beforeEach(function() {
			return room.user.say('mimiron', '@hubot ibm alert help');
		});

		it('should respond with help', function() {
			expect(room.messages.length).to.eql(2);
			let help =
				'hubot ibm alert change cpu|memory|disk threshold to x% - ' + i18n.__('help.ibm.alert.change') + '\n';
			help += 'hubot ibm alert list|show - ' + i18n.__('help.ibm.alert.list') + '\n';
			help += 'hubot ibm alert me when cpu|memory|disk exceeds x% - ' + i18n.__(
				'help.ibm.alert.set.app.resource') + '\n';
			help += 'hubot ibm alert turn on cpu|memory|disk|crash|all - ' + i18n.__('help.ibm.alert.on') + '\n';
			help += 'hubot ibm alert turn off cpu|memory|disk|crash|all - ' + i18n.__('help.ibm.alert.off') + '\n';
			expect(room.messages[1]).to.eql(['hubot', '@mimiron \n' + help]);
		});
	});

	context('Emit an activity`', function() {
		beforeEach(function() {
			room.robot.on('bot.activity', (activity) => {
				notify.createAlertNotification(room.robot, activity);
			});
		});
		it('should trigger an incident', function() {
			let alertContext = {
				spaceConfig: {
					testSpaceGuid: {
						guid: 'testSpaceGuid',
						name: 'testSpace',
						alerts: {
							cpu: {
								enabled: true,
								threshold: 40
							},
							memory: {
								enabled: true,
								threshold: 40
							},
							disk: {
								enabled: true,
								threshold: 40
							},
							event: {
								enabled: true
							}
						}
					}
				}
			};
			room.robot.brain.set(defaultAlertsContext, alertContext);
			return room.user.say('mimiron', '@hubot ibm alert me when memory exceeds 50%').then(() => {
				let response = room.messages[room.messages.length - 1];
				expect(response).to.eql(['hubot', '@mimiron ' + i18n.__('ibm.alert.enable.and.set.enabled', 'memory', '50',
					'%',
					validSpace)]);
				activity.emitBotActivity(room.robot, {}, {
					activity_id: 'activity.threshold.violation.memory',
					app_name: 'instanceStats.name',
					app_guid: 'instanceStats.app_guid',
					space_name: validSpace,
					space_guid: 'testSpaceGuid',
					threshold_percentage: 95
				});
			});
		});
	});
});
