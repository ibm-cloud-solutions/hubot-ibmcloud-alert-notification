/*
* Licensed Materials - Property of IBM
* (C) Copyright IBM Corp. 2016. All Rights Reserved.
* US Government Users Restricted Rights - Use, duplication or
* disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
'use strict';


const path = require('path');
const TAG = path.basename(__filename);
const request = require('request');
const utils = require('./utils.js');
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

const env = {
	endpoint: process.env.HUBOT_IBM_ALERT_NOTIFICATION_ENDPOINT,
	username: process.env.HUBOT_IBM_ALERT_NOTIFICATION_USERNAME,
	password: process.env.HUBOT_IBM_ALERT_NOTIFICATION_PASSWORD
};

const isAlertNotificationConfigured = () => {
	let result = false;
	if (env.endpoint && env.username && env.password) {
		result = true;
	}
	return result;
};

const getAlertType = (activity) => {
	let result = null;
	if (activity.activity_id === 'activity.threshold.violation.cpu') {
		result = 'cpu';
	}
	if (activity.activity_id === 'activity.threshold.violation.memory') {
		result = 'memory';
	}
	if (activity.activity_id === 'activity.threshold.violation.disk') {
		result = 'disk';
	}
	if (activity.activity_id === 'activity.app.crash') {
		result = 'crash';
	}
	return result;
};

const isAlertableActivity = (contextKey, robot, activity) => {
	let result = false;
	if (activity) {
		if (activity.activity_id === 'activity.threshold.violation.cpu' ||
		activity.activity_id === 'activity.threshold.violation.memory' ||
		activity.activity_id === 'activity.threshold.violation.disk' ||
		activity.activity_id === 'activity.app.crash') {
			let space_guid = activity.space_guid;
			let alertContext = robot.brain.get(contextKey);
			if (alertContext) {
				let spaceConfig = alertContext.spaceConfig[space_guid];
				if (spaceConfig && spaceConfig.alerts) {
					let alertType = getAlertType(activity);
					if (alertType) {
						let alert = spaceConfig.alerts[alertType];
						if (alert && alert.enabled) {
							if (alertType === 'crash'){
								result = true;
							}
							else if (alert.threshold && activity.threshold_percentage
								&& alert.threshold <= activity.threshold_percentage) {
								robot.logger.debug(`${TAG} alert.threshold(${alert.threshold}) <= activity.threshold_percentage(${activity.threshold_percentage})`);
								result = true;
							}
						}
					}
				}
			}
		}
	}
	return result;
};

const createIncident = (alert) => {
	// POST /alerts/v1
	let options = {
		method: 'POST',
		url: env.endpoint,
		auth: {
			username: env.username,
			password: env.password
		},
		headers: {
			Accept: 'application/json'
		},
		json: true,
		body: alert
	};

	let promise = new Promise((resolve, reject) => {
		request(options, function(error, response, body) {
			if (error) {
				reject(error);
			}
			else if (response.statusCode !== 200) {
				console.log(body);
				reject(response.statusCode);
			}
			else if (body) {
				resolve(body);
			}
		});
	});
	return promise;
};

const constructAlert = (robot, activity) => {
	let alertType = getAlertType(activity);
	let i18nString = 'ibm.alert.' + alertType;
	let alert = {};
	alert.What = i18n.__(i18nString, activity.app_name, activity.threshold_percentage + '%');
	alert.Where = `${activity.space_name}`;
	alert.Severity = 'Critical';
	alert.Source = robot.name;
	alert.ApplicationsOrServices = [activity.app_name];
	return alert;
};

const createAlertNotification = (robot, activity) => {
	if (isAlertNotificationConfigured()) {
		if (isAlertableActivity(utils.context, robot, activity)) {
			robot.logger.debug(`${TAG} Activity is alertable.`);
			let alert = constructAlert(robot, activity);
			createIncident(alert).then(() => {
				robot.logger.debug(`${TAG}: created incident successfully for alert:`);
				robot.logger.debug(alert);
			}).catch((err) => {
				robot.logger.error(`${TAG}: error=${err}`);
				robot.logger.error(err);
			});
		}
	}
};

const notify = {
	createAlertNotification: createAlertNotification
};

module.exports = notify;
