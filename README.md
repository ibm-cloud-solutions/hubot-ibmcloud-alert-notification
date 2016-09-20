[![Build Status](https://travis-ci.org/ibm-cloud-solutions/hubot-ibmcloud-alert-notification.svg?branch=master)](https://travis-ci.org/ibm-cloud-solutions/hubot-ibmcloud-alert-notification)
[![Coverage Status](https://coveralls.io/repos/github/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/badge.svg?branch=master)](https://coveralls.io/github/ibm-cloud-solutions/hubot-ibmcloud-alert-notification?branch=master)
[![Dependency Status](https://dependencyci.com/github/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/badge)](https://dependencyci.com/github/ibm-cloud-solutions/hubot-ibmcloud-alert-notification)
[![npm](https://img.shields.io/npm/v/hubot-ibmcloud-alert-notification.svg?maxAge=2592000)](https://www.npmjs.com/package/hubot-ibmcloud-alert-notification)

# hubot-ibmcloud-alert-notification

A hubot script that allows monitoring of applications and enabling alerts

## Getting Started
* [Usage](#usage)
* [Commands](#commands)
* [Hubot Adapter Setup](#hubot-adapter-setup)
* [Cognitive Setup](#cognitive-setup)
* [Development](#development)
* [License](#license)
* [Contribute](#contribute)

## Usage

Steps for adding this to your existing hubot:

1. `cd` into your hubot directory
2. Install the app management functionality with `npm install hubot-ibmcloud-alert-notification --save`
3. Add `hubot-ibmcloud-alert-notification` and `hubot-ibmcloud-alerts` to your `external-scripts.json`
4. Add the necessary environment variables:
```
export HUBOT_BLUEMIX_API=<Bluemix API URL>
export HUBOT_BLUEMIX_ORG=<Bluemix Organization>
export HUBOT_BLUEMIX_SPACE=<Bluemix space>
export HUBOT_BLUEMIX_USER=<Bluemix User ID>
export HUBOT_BLUEMIX_PASSWORD=<Password for the Bluemix use>
export HUBOT_IBM_ALERT_NOTIFICATION_ENDPOINT=<IBM Alert Notifications Endpoint URL>
export HUBOT_IBM_ALERT_NOTIFICATION_USERNAME=<IBM Alert Notification Username>
export HUBOT_IBM_ALERT_NOTIFICATION_PASSWORD=<IBM Alert Notification Password>
```
5. Start up your bot & off to the races!

## Commands

- `hubot ibm alert list|show` - Show status of enabled IBM Alert Notification triggers.
- `hubot ibm alert me when cpu|memory|disk exceeds x%` - Enable IBM Alert Notifications for a resource with a set threshold.
- `hubot ibm alert turn on cpu|memory|disk|crash|all` - Turns on IBM Alert Notifications for specified resource.
- `hubot ibm alert turn off cpu|memory|disk|crash|all` - Turns off IBM Alert Notifications for specified resource.
- `hubot ibm alert change cpu|memory|disk threshold to x%` - Sets IBM Alert Notification threshold trigger for specified resource.

_Note:_ You must enable resource monitoring with the `hubot-ibmcloud-alerts` script before enabling **IBM Alert Notifications**. See `hubot alert help` for more details.

## Hubot Adapter Setup

Hubot supports a variety of adapters to connect to popular chat clients.  For more feature rich experiences you can setup the following adapters:
- [Slack setup](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/docs/adapters/slack.md)
- [Facebook Messenger setup](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/docs/adapters/facebook.md)

## Cognitive Setup

This project supports natural language interactions using Watson and other Bluemix services.  For more information on enabling these features, refer to [Cognitive Setup](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-nlc/blob/master/docs/cognitiveSetup.md).

## Development

Please refer to the [CONTRIBUTING.md](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/CONTRIBUTING.md) before starting any work.  Steps for running this script for development purposes:

### Configuration Setup

1. Create `config` folder in root of this project.
2. Create `env` in the `config` folder, with the following contents:
```
export HUBOT_BLUEMIX_API=<Bluemix API URL>
export HUBOT_BLUEMIX_ORG=<Bluemix Organization>
export HUBOT_BLUEMIX_SPACE=<Bluemix space>
export HUBOT_BLUEMIX_USER=<Bluemix User ID>
export HUBOT_BLUEMIX_PASSWORD=<Password for the Bluemix use>
export HUBOT_IBM_ALERT_NOTIFICATION_ENDPOINT=<IBM Alert Notifications Endpoint URL>
export HUBOT_IBM_ALERT_NOTIFICATION_USERNAME=<IBM Alert Notification Username>
export HUBOT_IBM_ALERT_NOTIFICATION_PASSWORD=<IBM Alert Notification Password>
```
3. In order to view content in chat clients you will need to add `hubot-ibmcloud-formatter` to your `external-scripts.json` file. Additionally, if you want to use `hubot-help` to make sure your command documentation is correct. Create `external-scripts.json` in the root of this project
```
[
    "hubot-help",
    "hubot-ibmcloud-formatter"
]
```
4. Lastly, run `npm install` to obtain all the dependent node modules.

### Running Hubot with Adapters

Hubot supports a variety of adapters to connect to popular chat clients.

If you just want to use:
 - Terminal: run `npm run start`
 - [Slack: link to setup instructions](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/docs/adapters/slack.md)
 - [Facebook Messenger: link to setup instructions](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/docs/adapters/facebook.md)

## License

See [LICENSE.txt](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/LICENSE.txt) for license information.

## Contribute

Please check out our [Contribution Guidelines](https://github.com/ibm-cloud-solutions/hubot-ibmcloud-alert-notification/blob/master/CONTRIBUTING.md) for detailed information on how you can lend a hand.
