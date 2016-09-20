// Description:
//	Creates incidents for tracking and resolving within IBM Alert Notifications service
//
// Configuration:
//	 HUBOT_IBM_ALERT_NOTIFICATION_ENDPOINT IBM Alert Notifications Endpoint URL
//	 HUBOT_IBM_ALERT_NOTIFICATION_USERNAME IBM Alert Notification Username
//	 HUBOT_IBM_ALERT_NOTIFICATION_PASSWORD IBM Alert Notification Password
//
// Commands:
//   hubot ibm alert help - Show available commands associated with IBM Alert Notification category.
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

const ALERT_NOTIFICATION_HELP_REGEX = /ibm alert\s+help/i;
const ALERT_NOTIFICATION_ID = 'ibmcloud.alert.notification.help';

module.exports = (robot) => {

	robot.on(ALERT_NOTIFICATION_ID, (res) => {
		robot.logger.debug(`${TAG}: ${ALERT_NOTIFICATION_ID} Natural Language match.`);
		help(res);
	});

	robot.respond(ALERT_NOTIFICATION_HELP_REGEX, {id: ALERT_NOTIFICATION_ID}, (res) => {
		robot.logger.debug(`${TAG}: ${ALERT_NOTIFICATION_ID} Reg Ex match.`);
		help(res);
	});

	function help(res) {
		robot.logger.debug(`${TAG}: ${ALERT_NOTIFICATION_ID} res.message.text=${res.message.text}.`);
		robot.logger.info(`${TAG}: Listing ibmalert help...`);

		let help = `${robot.name} ibm alert change cpu|memory|disk threshold to x% - ` + i18n.__('help.ibm.alert.change') + '\n';
		help += `${robot.name} ibm alert list|show - ` + i18n.__('help.ibm.alert.list') + '\n';
		help += `${robot.name} ibm alert me when cpu|memory|disk exceeds x% - ` + i18n.__('help.ibm.alert.set.app.resource') + '\n';
		help += `${robot.name} ibm alert turn on cpu|memory|disk|crash|all - ` + i18n.__('help.ibm.alert.on') + '\n';
		help += `${robot.name} ibm alert turn off cpu|memory|disk|crash|all - ` + i18n.__('help.ibm.alert.off') + '\n';

		robot.emit('ibmcloud.formatter', { response: res, message: '\n' + help});
	};
};
