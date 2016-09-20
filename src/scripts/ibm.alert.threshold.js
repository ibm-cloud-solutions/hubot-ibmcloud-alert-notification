// Description:
//	Creates incidents for tracking and resolving within IBM Alert Notifications service
//
// Configuration:
//	 HUBOT_IBM_ALERT_NOTIFICATION_ENDPOINT IBM Alert Notifications Endpoint URL
//	 HUBOT_IBM_ALERT_NOTIFICATION_USERNAME IBM Alert Notification Username
//	 HUBOT_IBM_ALERT_NOTIFICATION_PASSWORD IBM Alert Notification Password
//
// Author:
//	chambrid
//
/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2016. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */
'use strict';

const path = require('path');
const TAG = path.basename(__filename);
const cf = require('hubot-cf-convenience');
const utils = require('../lib/utils.js');

// --------------------------------------------------------------
// i18n (internationalization)
// It will read from a peer messages.json file.  Later, these
// messages can be referenced throughout the module.
// --------------------------------------------------------------
const i18n = new (require('i18n-2'))({
	locales: ['en'],
	extension: '.json',
	// Add more languages to the list of locales when the files are created.
	directory: __dirname + '/../messages',
	defaultLocale: 'en',
	// Prevent messages file from being overwritten in error conditions (like poor JSON).
	updateFiles: false
});
// At some point we need to toggle this setting based on some user input.
i18n.setLocale('en');


const SET_THRESHOLD_ALERTS_REGEX = /ibm alert\s+(change |set )(cpu|memory|disk|all) threshold to (\d+)\s*(%|percent)/i;
const SET_THRESHOLD_ALERTS_ID = 'ibmcloud.alert.notification.set.threshold';


module.exports = (robot) => {

	robot.on(SET_THRESHOLD_ALERTS_ID, (res, parameters) => {
		robot.logger.debug(`${TAG}: ${SET_THRESHOLD_ALERTS_ID} Natural Language match.`);
		let thresholdType;
		let threshold;
		if (parameters && parameters.thresholdType) {
			thresholdType = parameters.thresholdType;
		}
		else {
			robot.logger.error(`${TAG}: Error extracting Threshold Type from text=[${res.message.text}].`);
			let message = i18n.__('cognitive.parse.problem.thresholdType');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
		}
		if (parameters && parameters.threshold) {
			threshold = Number(parameters.threshold);
		}
		else {
			robot.logger.error(`${TAG}: Error extracting Threshold from text=[${res.message.text}].`);
			let message = i18n.__('cognitive.parse.problem.threshold');
			robot.emit('ibmcloud.formatter', { response: res, message: message});
		}
		if (thresholdType && threshold) {
			configAlertWrapper(res, thresholdType, threshold);
		}
	});
	robot.respond(SET_THRESHOLD_ALERTS_REGEX, {
		id: SET_THRESHOLD_ALERTS_ID
	}, (res) => {
		robot.logger.debug(`${TAG}: ${SET_THRESHOLD_ALERTS_ID} Reg Ex match.`);
		const type = res.match[2];
		const threshold = Number(res.match[3]);
		configAlertWrapper(res, type, threshold);
	});
	function configAlertWrapper(res, type, threshold) {
		let message = utils.configAlert(robot, cf.activeSpace(robot, res), type, threshold);
		robot.emit('ibmcloud.formatter', { response: res, message: message});
	};


};
