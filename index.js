const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Welcome! Send me a YouTube link, and I'll download the audio for you in MP3 format."
  );
});

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // Check if message contains a YouTube link
  if (ytdl.validateURL(messageText)) {
    const videoId = ytdl.getURLVideoID(messageText);
    const downloadLink = `https://www.youtube.com/watch?v=${videoId}`;
    const outputFilePath = `./audio_${videoId}.mp3`;

    try {
      // Send initial message
      await bot.sendMessage(chatId, "Downloading audio, please wait...");

      // Download audio using ytdl-core and convert to MP3
      const audioStream = ytdl(downloadLink, { quality: "highestaudio" });
      const ffmpegCommand = ffmpeg(audioStream)
        .audioCodec("libmp3lame")
        .format("mp3")
        .save(outputFilePath);

      ffmpegCommand.on("end", async () => {
        // Send the MP3 file to the user
        await bot.sendAudio(chatId, outputFilePath, {
          caption: "Here is your MP3 file.",
        });

        // Delete the file after sending
        fs.unlinkSync(outputFilePath);
      });

      ffmpegCommand.on("error", (error) => {
        console.error("Error processing audio: ", error);
        bot.sendMessage(chatId, "There was an error processing your request.");
      });
    } catch (error) {
      console.error("Error downloading audio: ", error);
      bot.sendMessage(chatId, "An error occurred while downloading the audio.");
    }
  }
});