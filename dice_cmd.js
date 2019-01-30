const AWS = require('aws-sdk');
const tgApi = require('tgApi');
const conf = require('conf');

// Capture text after command
const rgx = RegExp(`^/dice(@${conf.botname})?\s(.*?)`, 'i');

module.exports = async function(event) {

    const message = event.message;
    var dice = 6;
    
    var parsed = rgx.exec(message.text);
    if (parsed){
        try {
            dice = parseInt(parsed[2]);
        } catch(e) {
			// We do not even care
        }
    };
    
    const n = Math.floor(dice * Math.random()) + 1;
    
    console.info('Random N value', n, dice);
    
    const msg = {
        'chat_id': message.chat.id,
        'reply_to_message_id': message.message_id,
        'text': `${n}`
    }
    
    return tgApi('sendMessage', msg);
}
