// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Start command for the bot

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "Welcome! I'm Kavi_official telegram bot . You can use me to everything "
    );
  });
};