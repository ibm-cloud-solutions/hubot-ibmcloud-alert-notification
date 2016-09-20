/*
 * Licensed Materials - Property of IBM
 * (C) Copyright IBM Corp. 2016. All Rights Reserved.
 * US Government Users Restricted Rights - Use, duplication or
 * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
*/
'use strict';

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


const context = 'IBM_ALERT_NOTIFICATION_CONTEXT';
const defaultAlertsContext = 'DEFAULT_ALERT_CONTEXT';

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const isAlertsEnabled = (robot, space, type, threshold) => {
	let result = false;
	let alertContext = robot.brain.get(defaultAlertsContext);
	if (alertContext && alertContext.spaceConfig && alertContext.spaceConfig[space.guid]) {
		let spaceConfig = alertContext.spaceConfig[space.guid];
		let alertType = type;
		if (type === 'crash') {
			alertType = 'event';
		}
		if (spaceConfig.alerts[alertType].enabled) {
			if (type === 'crash') {
				result = true;
			}
			else if (type === 'cpu' || type === 'memory' || type === 'disk') {
				if (threshold) {
					if (spaceConfig.alerts[alertType].threshold <= threshold) {
						result = true;
					}
				}
				else {
					result = true;
				}
			}
		}
	}
	return result;
};

const setAlertContext = (robot, alertContext) => {
	if (robot.brain) {
		// initialize contexts
		robot.brain.set(context, alertContext);
	}
};

const getRoom = (robot, res) => {
	let room;
	if (robot && robot.adapter && robot.adapter.client && robot.adapter.client.rtm && robot.adapter.client.rtm.dataStore &&
				res && res.message && res.message.room) {
		let roomObj = robot.adapter.client.rtm.dataStore.getChannelGroupOrDMById(res.message.room);
		if (roomObj.name) {
			room = roomObj.name;
		}
	}
	return room;
};

const checkAlertsEnabled = (robot, space, type) => {
	let alertsEnabled = false;
	if (type === 'all') {
		if (isAlertsEnabled(robot, space, 'cpu') && isAlertsEnabled(robot, space, 'memory')
		&& isAlertsEnabled(robot, space, 'disk') && isAlertsEnabled(robot, space, 'crash')) {
			alertsEnabled = true;
		}
	}
	else if (isAlertsEnabled(robot, space, type)) {
		alertsEnabled = true;
	}
	return alertsEnabled;
};

const enableAlerts = (robot, space, type, res) => {
	let alertsEnabled = false;
	let alertContext = robot.brain.get(context);
	if (!type) {
		type = 'all';
	}
	type = type.trim().toLowerCase();

	alertsEnabled = checkAlertsEnabled(robot, space, type);
	if (!alertsEnabled) {
		return i18n.__('ibm.alert.alerts.must.be.enabled', capitalizeFirstLetter(type), space.name, robot.name);
	}

	// get alert config for the space, create if needed.
	let spaceConfig = null;
	if (alertContext) {
		spaceConfig = alertContext.spaceConfig[space.guid];
	}
	if (!spaceConfig) {
		spaceConfig = {
			guid: space.guid,
			name: space.name,
			alerts: {
				cpu: {
					enabled: false,
					threshold: 85
				},
				memory: {
					enabled: false,
					threshold: 85
				},
				disk: {
					enabled: false,
					threshold: 85
				},
				crash: {
					enabled: false
				}
			}
		};
		if (!alertContext) {
			alertContext = {
				spaceConfig: {}
			};
		}
		alertContext.spaceConfig[space.guid] = spaceConfig;
	}

	if (type === 'all') {
		for (let t in spaceConfig.alerts) {
			spaceConfig.alerts[t].enabled = true;
		}
	}
	else {
		spaceConfig.alerts[type].enabled = true;
	}


	if (res) {
		let oldRoom = utils.getRoom(robot, spaceConfig.res);
		let newRoom = utils.getRoom(robot, res);

		if (oldRoom && newRoom && oldRoom !== newRoom) {
			// user switch rooms.  tell old room that alerts for this space will go to the new room.
			let message = i18n.__('ibm.alert.move.complete', spaceConfig.name, newRoom);
			robot.emit('ibmcloud.formatter', { response: spaceConfig.res, message: message}); // notify old room
			robot.emit('ibmcloud.formatter', { response: res, message: message});  // notify new room
		}

		// res, ties back to room.  always send alerts to the latest room they were enabled in.
		spaceConfig.res = res;
	}
	setAlertContext(robot, alertContext);

	return i18n.__('ibm.alert.enabled', type, spaceConfig.name);
};

const configAlert = (robot, space, type, threshold) => {
	let alertsEnabled = false;
	let responseText = '';
	const alertContext = robot.brain.get(context);
	if (threshold < 1 || threshold > 100) {
		responseText += i18n.__('ibm.alert.config.invalid', threshold, '%');
	}
	else {
		if (isAlertsEnabled(robot, space, type, threshold)) {
			alertsEnabled = true;
		}
		if (!alertsEnabled) {
			responseText = i18n.__('ibm.alert.alerts.must.be.enabled.with.threshold', capitalizeFirstLetter(type), space.name, threshold, robot.name);
		}
		else {
			let spaceConfig = null;
			if (alertContext) {
				spaceConfig = alertContext.spaceConfig[space.guid];
			}
			if (!spaceConfig || !spaceConfig.alerts[type].enabled) {
				responseText = i18n.__('ibm.alert.config.please.enable', type);
			}
			else {
				spaceConfig.alerts[type].threshold = threshold;
				responseText += i18n.__('ibm.alert.config.enabled', type, threshold, '%', space.name);
				setAlertContext(robot, alertContext);
			}
		}
	}
	return responseText;
};

const enableAndSet = (robot, space, type, threshold, res) => {
	let responseText = '';

	if (threshold < 1 || threshold > 100) {
		responseText += i18n.__('ibm.alert.enable.and.set.invalid', threshold, '%s');
	}
	else {
		let alertsEnabled = checkAlertsEnabled(robot, space, type);
		if (!alertsEnabled) {
			responseText = i18n.__('ibm.alert.alerts.must.be.enabled', capitalizeFirstLetter(type), space.name, robot.name);
		}
		else {
			enableAlerts(robot, space, type, res);
			configAlert(robot, space, type, threshold);
			responseText += i18n.__('ibm.alert.enable.and.set.enabled', type, threshold, '%', space.name);
		}
	}

	return responseText;
};

const allAlertsDisabled = (spaceConfig) => {
	let enabled = false;
	for (let type in spaceConfig.alerts) {
		let alert = spaceConfig.alerts[type];
		if (alert.enabled) {
			enabled = true;
		}
	}
	return !enabled;
};

const disableAlerts = (robot, space, type) => {
	let responseText = '';
	const alertContext = robot.brain.get(context);
	if (!type) {
		type = 'all';
	}
	type = type.trim().toLowerCase();

	let spaceConfig = null;
	if (alertContext && alertContext.spaceConfig) {
		spaceConfig = alertContext.spaceConfig[space.guid];
	}
	if (!spaceConfig) {
		responseText = i18n.__('ibm.alert.disabled.no.alerts', space.name);
	}
	else {
		if (type === 'all') {
			for (let t in spaceConfig.alerts) {
				spaceConfig.alerts[t].enabled = false;
			}
		}
		else {
			spaceConfig.alerts[type].enabled = false;
		}
		responseText = i18n.__('ibm.alert.disabled', type, space.name);
		if (allAlertsDisabled(spaceConfig)) {
			delete alertContext.spaceConfig[spaceConfig.guid];
		}
		setAlertContext(robot, alertContext);
	}
	return responseText;
};

const getSpacesWithEnabledAlerts = (alertContext, thresholdReq, alertType) => {
	let configs = [];
	if (alertContext) {
		for (let guid in alertContext.spaceConfig) {
			let spaceConfig = alertContext.spaceConfig[guid];

			for (let type in spaceConfig.alerts) {
				let alert = spaceConfig.alerts[type];
				if (thresholdReq && !alert.threshold) {
					// don't include.
				}
				else if (alertType && type !== alertType) {
					// don't include.
				}
				else if (alert.enabled) {
					configs.push(spaceConfig);
					break;
				}
			}
		}
	}
	return configs;
};

const listAlerts = (robot) => {
	let responseText = '';
	const alertContext = robot.brain.get(context);
	const enabledConfigs = getSpacesWithEnabledAlerts(alertContext);

	enabledConfigs.forEach((spaceConfig) => {
		let spaceText = i18n.__('ibm.alert.list.enabled', spaceConfig.name);

		for (let type in spaceConfig.alerts) {
			let alert = spaceConfig.alerts[type];

			if (alert.enabled) {
				spaceText += ` ${type}${alert.threshold ? ':' + alert.threshold + '%' : ''},`; // nothing to translate
			}
		}

		spaceText = spaceText.substr(0, spaceText.length - 1); // remove last comma.
		responseText += spaceText + '\n';
	});

	if (!responseText.length) {
		responseText = i18n.__('ibm.alert.list.off');
	}
	return responseText;
};

const utils = {
	getRoom: getRoom,
	enableAlerts: enableAlerts,
	configAlert: configAlert,
	enableAndSet: enableAndSet,
	allAlertsDisabled: allAlertsDisabled,
	disableAlerts: disableAlerts,
	listAlerts: listAlerts,
	getSpacesWithEnabledAlerts: getSpacesWithEnabledAlerts,
	setAlertContext: setAlertContext
};

module.exports = utils;
