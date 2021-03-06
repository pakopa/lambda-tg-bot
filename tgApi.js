// Simple interface to call telegram API
const token = process.env['tgToken'];
const https = require('https');

/**
 * Call a telegram API method
 * 
 * @see https://core.telegram.org/bots/api#available-methods
 * 
 * @param {string} method telegram API method to be called
 * @param {*} message message to be sent to the API
 * @param {boolean} ignoreResponse resolve the promise as soon as the response is received, without reading the response data.
 
 * @returns a Promise that resolves the returned telegram api response or rejects the http error.
 */
async function tgApi(method, message, ignoreResponse) {

	const path = `/bot${token}/${method}`;

	const data = JSON.stringify(message);

	// Build the http request
	const options = {
		protocol: 'https:',
		hostname: 'api.telegram.org',
		port: 443,
		method: 'POST',
		path: path,
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	};

	const callPromise = new Promise((resolve) => {

		const req = https.request(options, (resp) => {

			console.info('Telegram API response:', resp.statusCode);
			
			// Sometimes we do not need the response
			if (ignoreResponse) {
				console.info('Response ignored');
				resolve(null);
				return;
			}

			var rawData = [];

			// Concat received data and parse when the stream ends
			resp.on('data', (chunk) => {

				rawData.push(chunk);

			}).on('end', () => {

				var contents = Buffer.concat(rawData).toString();

				// Return the read object
				resolve(JSON.parse(contents));
			});
		});

		req.write(data);
		req.end();

		console.info('Telegram API message sent', method, data);
	});

	return callPromise;
}

module.exports = tgApi;
