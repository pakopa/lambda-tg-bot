const AWS = require('aws-sdk');
const conf = require('conf');

// Regular expression to parse a command message, either /<command> or /<command>@<yourbotname>
// You might allow case insensitive with the 'i' flag, but do not use the global 'g' flag
const cmdRgx = RegExp(`^/(\\w+)(@${conf.botname})?`);

/**
 * AWS Lambda entry point, since we will be receiving calls from AWS Api Gateway, the event will be the message telegram sends to the defined webhook
 */
exports.handler = async function (event, context) {

	// Get and log the received message
	const message = event.message;
	console.info('Received:', message.text, event);

	// try to match the message text against the command parser
	const command = cmdRgx.exec(message.text);

	if (command) {

		try {

			// I a command has been found try to load the <command>_cmd module
			var cmdModule = require(command[1] + '_cmd');

			// execute the command, passing the whole telegram input and return, 
			// returning before the command ends execution terminates the function execution interrupting the command, so we "await"
			await cmdModule(event);
			return 'OK';

		} catch (e) {

			// Log the error and return
			console.warn(e);
			return 'OK';
		}

	}

	// No command found, nothing to do.
	return 'OK';
};
