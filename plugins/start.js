// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Start command for the bot

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "Welcome! Send me a YouTube link, and I'll download the audio for you in MP3 format."
    );
  });
};