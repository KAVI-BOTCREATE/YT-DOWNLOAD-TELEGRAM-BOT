const TelegramBot = require('telegram-bot-api');
const fs = require('fs');
const path = require('path');

// Initialize the Telegram Bot
const api = new TelegramBot({
    token: '7916631091:AAFABgUgo-tVw7AHrhmIffDzb2bNwy4fygQ',
    updates: { enabled: true }
});

// Command handling configuration
const commands = {
    song: {
        com: '/song',
        dec: 'Download a YouTube video as MP3',
        use: 'Send /song followed by a YouTube link to download MP3'
    }
};

// Function to handle commands and load plugins
function handleCommand(command, message) {
    switch (command) {
        case commands.song.com:
            require('./plugins/song').execute(api, message);
            break;
        default:
            api.sendMessage({
                chat_id: message.chat.id,
                text: "Invalid command. Available command: /song"
            });
    }
}

// Message listener
api.on('message', (message) => {
    const chatId = message.chat.id;
    const text = message.text;

    if (!text.startsWith('/')) {
        api.sendMessage({
            chat_id: chatId,
            text: "Please use a valid command (e.g., /song <YouTube link>)."
        });
        return;
    }

    const [command, ...args] = text.split(" ");
    message.args = args.join(" ");
    handleCommand(command, message);
});
