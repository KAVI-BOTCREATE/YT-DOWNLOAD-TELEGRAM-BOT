const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const fs = require("fs");
const ytdl = require("ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome! Send a YouTube link to download the video.");
});

bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Check if the message is a YouTube link
    if (messageText.includes("youtube.com") || messageText.includes("youtu.be")) {
        try {
            const videoId = ytdl.getURLVideoID(messageText);
            const downloadLink = `https://www.youtube.com/watch?v=${videoId}`;

            const mp4DownloadPath = path.resolve(__dirname, `video_${videoId}.mp4`);
            const mp3DownloadPath = path.resolve(__dirname, `audio_${videoId}.mp3`);
            const mergedFilePath = path.resolve(__dirname, `merged_${videoId}.mp4`);

            // Download video
            const mp4Stream = ytdl(downloadLink, { filter: "videoonly", quality: "highest" });
            mp4Stream.pipe(fs.createWriteStream(mp4DownloadPath));

            mp4Stream.on("end", () => {
                // Download audio
                const mp3Stream = ytdl(downloadLink, { filter: "audioonly", quality: "highestaudio" });
                mp3Stream.pipe(fs.createWriteStream(mp3DownloadPath));

                mp3Stream.on("end", () => {
                    // Merge video and audio
                    ffmpeg()
                        .input(mp4DownloadPath)
                        .input(mp3DownloadPath)
                        .output(mergedFilePath)
                        .on("end", async () => {
                            // Send merged video
                            const videoData = fs.createReadStream(mergedFilePath);
                            await bot.sendVideo(chatId, videoData, { caption: "Here is your downloaded video!" });

                            // Clean up files
                            fs.unlinkSync(mp4DownloadPath);
                            fs.unlinkSync(mp3DownloadPath);
                            fs.unlinkSync(mergedFilePath);
                        })
                        .on("error", (error) => {
                            console.error("Error merging files:", error);
                            bot.sendMessage(chatId, "An error occurred while merging files.");
                        })
                        .run();
                });

                mp3Stream.on("error", (error) => {
                    console.error("Error downloading audio:", error);
                    bot.sendMessage(chatId, "An error occurred while downloading audio.");
                });
            });

            mp4Stream.on("error", (error) => {
                console.error("Error downloading video:", error);
                bot.sendMessage(chatId, "An error occurred while downloading video.");
            });
        } catch (error) {
            console.error("Error processing request:", error);
            bot.sendMessage(chatId, "Failed to process the YouTube link. Please try again.");
        }
    }
});
