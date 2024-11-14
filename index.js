// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Import necessary modules and setup
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
require("dotenv").config();

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Load plugins dynamically from the plugins folder
const loadPlugins = () => {
  const pluginFiles = fs.readdirSync("./plugins").filter(file => file.endsWith(".js"));

  for (const file of pluginFiles) {
    const plugin = require(`./plugins/${file}`);
    plugin(bot);
  }
};

// Load all plugins
loadPlugins();