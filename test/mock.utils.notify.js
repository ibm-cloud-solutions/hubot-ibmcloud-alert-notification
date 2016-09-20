/*
  * Licensed Materials - Property of IBM
  * (C) Copyright IBM Corp. 2016. All Rights Reserved.
  * US Government Users Restricted Rights - Use, duplication or
  * disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
  */
'use strict';

const nock = require('nock');
nock.disableNetConnect();
nock.enableNetConnect('localhost');

const notify_endpoint = process.env.HUBOT_IBM_ALERT_NOTIFICATION_ENDPOINT;

module.exports = {

	setupMockery: function() {
		// Mockery for request to IBM Alert Notification.
		let notifyScope = nock(notify_endpoint)
			.persist();

		notifyScope.post('/')
			.reply(200);
	}
};
