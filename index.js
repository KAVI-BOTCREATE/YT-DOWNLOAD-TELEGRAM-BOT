// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Import necessary modules and setup
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const fs = require("fs");
const ytdlMp3 = require("ytdl-mp3");
const { download } = require("youtubedl-core");

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Start command to welcome users
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome! Send me a YouTube link, and I'll download the audio for you in MP3 format."
  );
});

// ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
// Main message listener for YouTube links
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Validate if the message contains a YouTube URL
  if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(messageText)) {
    const videoId = messageText.split("v=")[1] || messageText.split("/").pop();
    const outputFilePath = `./audio_${videoId}.mp3`;

    try {
      // Send a message to let the user know the download is starting
      await bot.sendMessage(chatId, "Downloading audio, please wait...");

      // ▂▂▂▂▂▂▂▂ KAVI_OFFICIAL ▂▂▂▂▂▂▂▂▂
      // Use ytdl-mp3 to download and convert the video to MP3 format
      await ytdlMp3(messageText, { output: outputFilePath });

      // Send the downloaded MP3 file to the user
      await bot.sendAudio(chatId, outputFilePath, {
        caption: "Here is your MP3 file.",
      });

      // Delete the MP3 file after sending
      fs.unlinkSync(outputFilePath);
    } catch (error) {
      console.error("Error downloading audio: ", error);
      bot.sendMessage(chatId, "An error occurred while downloading the audio.");
    }
  } else {
    // Notify user if the provided link is not valid
    bot.sendMessage(chatId, "Please send a valid YouTube link.");
  }
});