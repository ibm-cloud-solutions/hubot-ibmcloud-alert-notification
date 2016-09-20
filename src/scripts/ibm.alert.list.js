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


const LIST_ALERTS_REGEX = /ibm alert\s+(show|list)/i;
const LIST_ALERTS_ID = 'ibmcloud.alert.notification.list';


module.exports = (robot) => {

	robot.on(LIST_ALERTS_ID, (res) => {
		robot.logger.debug(`${TAG}: ${LIST_ALERTS_ID} Natural Language match.`);
		listAlertsWrapper(res);
	});
	robot.respond(LIST_ALERTS_REGEX, {
		id: LIST_ALERTS_ID
	}, (res) => {
		robot.logger.debug(`${TAG}: ${LIST_ALERTS_ID} Reg Ex match.`);
		listAlertsWrapper(res);
	});
	function listAlertsWrapper(res) {
		robot.logger.debug(`${TAG}: ${LIST_ALERTS_ID} res.message.text=${res.message.text}.`);
		let message = utils.listAlerts(robot);
		robot.emit('ibmcloud.formatter', { response: res, message: message});
	}

};
